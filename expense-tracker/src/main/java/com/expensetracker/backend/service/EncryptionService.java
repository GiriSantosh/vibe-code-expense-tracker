package com.expensetracker.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;
import java.util.Base64;

@Service
public class EncryptionService {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 16;
    private static final String SEPARATOR = ":";
    private static final String PBKDF2_ALGORITHM = "PBKDF2WithHmacSHA256";
    private static final int PBKDF2_ITERATIONS = 100000; // OWASP recommended minimum
    private static final int KEY_LENGTH = 256; // bits
    private static final byte[] STATIC_SALT = "ExpenseTracker2025-Salt-AES256-GCM".getBytes(StandardCharsets.UTF_8);

    @Value("${encryption.master-key:}")
    private String masterKeyString;
    
    @PostConstruct
    private void validateConfiguration() {
        if (masterKeyString == null || masterKeyString.trim().isEmpty()) {
            throw new IllegalStateException(
                "CRITICAL SECURITY ERROR: encryption.master-key environment variable is required and cannot be empty. " +
                "Set ENCRYPTION_MASTER_KEY environment variable with a strong passphrase (minimum 32 characters)."
            );
        }
        if (masterKeyString.length() < 32) {
            throw new IllegalStateException(
                "CRITICAL SECURITY ERROR: encryption.master-key must be at least 32 characters long for security. " +
                "Current length: " + masterKeyString.length()
            );
        }
    }

    public String encrypt(String plaintext) {
        if (plaintext == null || plaintext.isEmpty()) {
            return plaintext;
        }

        try {
            SecretKey secretKey = getSecretKey();
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            
            byte[] iv = generateIV();
            GCMParameterSpec gcmParameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH * 8, iv);
            
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, gcmParameterSpec);
            byte[] ciphertext = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));
            
            String encodedIV = Base64.getEncoder().encodeToString(iv);
            String encodedCiphertext = Base64.getEncoder().encodeToString(ciphertext);
            
            return encodedIV + SEPARATOR + encodedCiphertext;
        } catch (Exception e) {
            throw new RuntimeException("Error encrypting data", e);
        }
    }

    public String decrypt(String encryptedData) {
        if (encryptedData == null || encryptedData.isEmpty()) {
            return encryptedData;
        }

        try {
            String[] parts = encryptedData.split(SEPARATOR);
            if (parts.length != 2) {
                throw new IllegalArgumentException("Invalid encrypted data format");
            }

            byte[] iv = Base64.getDecoder().decode(parts[0]);
            byte[] ciphertext = Base64.getDecoder().decode(parts[1]);

            SecretKey secretKey = getSecretKey();
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec gcmParameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH * 8, iv);
            
            cipher.init(Cipher.DECRYPT_MODE, secretKey, gcmParameterSpec);
            byte[] plaintext = cipher.doFinal(ciphertext);
            
            return new String(plaintext, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Error decrypting data", e);
        }
    }

    private SecretKey getSecretKey() {
        try {
            SecretKeyFactory factory = SecretKeyFactory.getInstance(PBKDF2_ALGORITHM);
            PBEKeySpec spec = new PBEKeySpec(
                masterKeyString.toCharArray(),
                STATIC_SALT,
                PBKDF2_ITERATIONS,
                KEY_LENGTH
            );
            SecretKey pbkdf2Key = factory.generateSecret(spec);
            spec.clearPassword(); // Clear sensitive data
            return new SecretKeySpec(pbkdf2Key.getEncoded(), "AES");
        } catch (NoSuchAlgorithmException | InvalidKeySpecException e) {
            throw new RuntimeException("Failed to derive encryption key using PBKDF2", e);
        }
    }

    private byte[] generateIV() {
        byte[] iv = new byte[GCM_IV_LENGTH];
        new SecureRandom().nextBytes(iv);
        return iv;
    }
}