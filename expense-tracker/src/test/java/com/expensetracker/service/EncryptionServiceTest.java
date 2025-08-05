package com.expensetracker.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@DisplayName("EncryptionService Tests")
public class EncryptionServiceTest {

    private EncryptionService encryptionService;
    private final String testMasterKey = "testKey123456789012345678901234"; // 32 characters

    @BeforeEach
    void setUp() {
        encryptionService = new EncryptionService();
        ReflectionTestUtils.setField(encryptionService, "masterKeyString", testMasterKey);
    }

    @Test
    @DisplayName("Should encrypt and decrypt text successfully")
    void whenEncryptAndDecrypt_thenReturnOriginalText() {
        // Given
        String originalText = "sensitive@email.com";

        // When
        String encrypted = encryptionService.encrypt(originalText);
        String decrypted = encryptionService.decrypt(encrypted);

        // Then
        assertThat(decrypted).isEqualTo(originalText);
        assertThat(encrypted).isNotEqualTo(originalText);
        assertThat(encrypted).contains(":"); // Should contain IV separator
    }

    @Test
    @DisplayName("Should handle null input gracefully")
    void whenEncryptNull_thenReturnNull() {
        // When
        String encrypted = encryptionService.encrypt(null);
        String decrypted = encryptionService.decrypt(null);

        // Then
        assertThat(encrypted).isNull();
        assertThat(decrypted).isNull();
    }

    @Test
    @DisplayName("Should handle empty string gracefully")
    void whenEncryptEmptyString_thenReturnEmptyString() {
        // When
        String encrypted = encryptionService.encrypt("");
        String decrypted = encryptionService.decrypt("");

        // Then
        assertThat(encrypted).isEmpty();
        assertThat(decrypted).isEmpty();
    }

    @ParameterizedTest
    @ValueSource(strings = {
        "test@example.com",
        "user@domain.org",
        "very.long.email.address@subdomain.example.com",
        "special+chars@test-domain.co.uk",
        "unicode.测试@example.com"
    })
    @DisplayName("Should encrypt and decrypt various email formats")
    void whenEncryptVariousEmails_thenDecryptCorrectly(String email) {
        // When
        String encrypted = encryptionService.encrypt(email);
        String decrypted = encryptionService.decrypt(encrypted);

        // Then
        assertThat(decrypted).isEqualTo(email);
        assertThat(encrypted).isNotEqualTo(email);
    }

    @Test
    @DisplayName("Should generate different ciphertext for same plaintext")
    void whenEncryptSameTextTwice_thenGenerateDifferentCiphertext() {
        // Given
        String plaintext = "test@example.com";

        // When
        String encrypted1 = encryptionService.encrypt(plaintext);
        String encrypted2 = encryptionService.encrypt(plaintext);

        // Then
        assertThat(encrypted1).isNotEqualTo(encrypted2); // Different IV should result in different ciphertext
        assertThat(encryptionService.decrypt(encrypted1)).isEqualTo(plaintext);
        assertThat(encryptionService.decrypt(encrypted2)).isEqualTo(plaintext);
    }

    @Test
    @DisplayName("Should handle long text encryption")
    void whenEncryptLongText_thenDecryptCorrectly() {
        // Given
        String longText = "This is a very long email address that exceeds normal lengths: " +
                         "very.very.very.long.email.address.with.multiple.subdomains@" +
                         "subdomain1.subdomain2.subdomain3.example.domain.com";

        // When
        String encrypted = encryptionService.encrypt(longText);
        String decrypted = encryptionService.decrypt(encrypted);

        // Then
        assertThat(decrypted).isEqualTo(longText);
    }

    @Test
    @DisplayName("Should throw exception for invalid encrypted data format")
    void whenDecryptInvalidFormat_thenThrowException() {
        // Given
        String invalidEncryptedData = "invalid-format-without-separator";

        // When & Then
        assertThrows(RuntimeException.class, () -> encryptionService.decrypt(invalidEncryptedData));
    }

    @Test
    @DisplayName("Should throw exception for corrupted encrypted data")
    void whenDecryptCorruptedData_thenThrowException() {
        // Given
        String corruptedData = "invalidIV:invalidCiphertext";

        // When & Then
        assertThrows(RuntimeException.class, () -> encryptionService.decrypt(corruptedData));
    }

    @Test
    @DisplayName("Should handle special characters in encryption")
    void whenEncryptSpecialCharacters_thenDecryptCorrectly() {
        // Given
        String specialChars = "email+tag@domain.com!@#$%^&*()";

        // When
        String encrypted = encryptionService.encrypt(specialChars);
        String decrypted = encryptionService.decrypt(encrypted);

        // Then
        assertThat(decrypted).isEqualTo(specialChars);
    }

    @Test
    @DisplayName("Should encrypt consistently with same master key")
    void whenUsingSameMasterKey_thenDecryptionWorks() {
        // Given
        String plaintext = "test@example.com";
        String encrypted = encryptionService.encrypt(plaintext);

        // Create new service instance with same key
        EncryptionService newService = new EncryptionService();
        ReflectionTestUtils.setField(newService, "masterKeyString", testMasterKey);

        // When
        String decrypted = newService.decrypt(encrypted);

        // Then
        assertThat(decrypted).isEqualTo(plaintext);
    }

    @Test
    @DisplayName("Should fail decryption with different master key")
    void whenUsingDifferentMasterKey_thenDecryptionFails() {
        // Given
        String plaintext = "test@example.com";
        String encrypted = encryptionService.encrypt(plaintext);

        // Create new service instance with different key
        EncryptionService newService = new EncryptionService();
        ReflectionTestUtils.setField(newService, "masterKeyString", "differentKey123456789012345678"); // Different 32-char key

        // When & Then
        assertThrows(RuntimeException.class, () -> newService.decrypt(encrypted));
    }

    @Test
    @DisplayName("Should validate encrypted data format")
    void whenEncryptData_thenFormatIsValid() {
        // Given
        String plaintext = "test@example.com";

        // When
        String encrypted = encryptionService.encrypt(plaintext);

        // Then
        assertThat(encrypted).contains(":");
        String[] parts = encrypted.split(":");
        assertThat(parts).hasSize(2);
        assertThat(parts[0]).isNotEmpty(); // IV part
        assertThat(parts[1]).isNotEmpty(); // Ciphertext part
    }

    @Test
    @DisplayName("Should handle Unicode characters")
    void whenEncryptUnicodeText_thenDecryptCorrectly() {
        // Given
        String unicodeText = "用户@测试域.中国";

        // When
        String encrypted = encryptionService.encrypt(unicodeText);
        String decrypted = encryptionService.decrypt(encrypted);

        // Then
        assertThat(decrypted).isEqualTo(unicodeText);
    }

    @Test
    @DisplayName("Should maintain data integrity across multiple operations")
    void whenMultipleEncryptDecryptOperations_thenMaintainIntegrity() {
        // Given
        String[] testEmails = {
            "user1@example.com",
            "user2@test.org",
            "admin@company.co.uk"
        };

        // When & Then
        for (String email : testEmails) {
            String encrypted = encryptionService.encrypt(email);
            String decrypted = encryptionService.decrypt(encrypted);
            assertThat(decrypted).isEqualTo(email);
        }
    }
}