package com.expensetracker.service;

import com.expensetracker.backend.service.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

@ActiveProfiles("test")
class EncryptionServiceTest {

    private EncryptionService encryptionService;

    @BeforeEach
    void setUp() {
        encryptionService = new EncryptionService();
        // Set a test master key
        ReflectionTestUtils.setField(encryptionService, "masterKeyString", "testMasterKey123456789012345678901234");
    }

    @Test
    @DisplayName("Should encrypt and decrypt text successfully")
    void shouldEncryptAndDecryptTextSuccessfully() {
        // Given
        String plaintext = "sensitive@email.com";

        // When
        String encrypted = encryptionService.encrypt(plaintext);
        String decrypted = encryptionService.decrypt(encrypted);

        // Then
        assertNotNull(encrypted);
        assertNotEquals(plaintext, encrypted);
        assertEquals(plaintext, decrypted);
        
        // Verify encrypted format (IV:ciphertext)
        assertTrue(encrypted.contains(":"));
        String[] parts = encrypted.split(":");
        assertEquals(2, parts.length);
    }

    @Test
    @DisplayName("Should produce different encrypted values for same plaintext")
    void shouldProduceDifferentEncryptedValuesForSamePlaintext() {
        // Given
        String plaintext = "test@example.com";

        // When
        String encrypted1 = encryptionService.encrypt(plaintext);
        String encrypted2 = encryptionService.encrypt(plaintext);

        // Then
        assertNotEquals(encrypted1, encrypted2);
        
        // But both should decrypt to the same plaintext
        assertEquals(plaintext, encryptionService.decrypt(encrypted1));
        assertEquals(plaintext, encryptionService.decrypt(encrypted2));
    }

    @Test
    @DisplayName("Should handle null input gracefully")
    void shouldHandleNullInputGracefully() {
        // When & Then
        assertNull(encryptionService.encrypt(null));
        assertNull(encryptionService.decrypt(null));
    }

    @Test
    @DisplayName("Should handle empty string input gracefully")
    void shouldHandleEmptyStringInputGracefully() {
        // Given
        String empty = "";

        // When & Then
        assertEquals(empty, encryptionService.encrypt(empty));
        assertEquals(empty, encryptionService.decrypt(empty));
    }

    @Test
    @DisplayName("Should throw exception for invalid encrypted data format")
    void shouldThrowExceptionForInvalidEncryptedDataFormat() {
        // Given
        String invalidFormat = "invalidencrypteddata";

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> encryptionService.decrypt(invalidFormat));
        
        assertTrue(exception.getMessage().contains("Error decrypting data"));
        assertTrue(exception.getCause() instanceof IllegalArgumentException);
    }

    @Test
    @DisplayName("Should throw exception for corrupted encrypted data")
    void shouldThrowExceptionForCorruptedEncryptedData() {
        // Given
        String plaintext = "test@example.com";
        String encrypted = encryptionService.encrypt(plaintext);
        
        // Corrupt the encrypted data
        String corrupted = encrypted.replace("A", "B");

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> encryptionService.decrypt(corrupted));
        
        assertTrue(exception.getMessage().contains("Error decrypting data"));
    }

    @Test
    @DisplayName("Should handle special characters in plaintext")
    void shouldHandleSpecialCharactersInPlaintext() {
        // Given
        String specialChars = "user@domain.com!@#$%^&*(){}[]|\\:;\"'<>,.?/~`";

        // When
        String encrypted = encryptionService.encrypt(specialChars);
        String decrypted = encryptionService.decrypt(encrypted);

        // Then
        assertEquals(specialChars, decrypted);
    }

    @Test
    @DisplayName("Should handle Unicode characters in plaintext")
    void shouldHandleUnicodeCharactersInPlaintext() {
        // Given
        String unicode = "test@domain.com 测试 🔐 ñáéíóú";

        // When
        String encrypted = encryptionService.encrypt(unicode);
        String decrypted = encryptionService.decrypt(encrypted);

        // Then
        assertEquals(unicode, decrypted);
    }

    @Test
    @DisplayName("Should handle long text encryption")
    void shouldHandleLongTextEncryption() {
        // Given
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 1000; i++) {
            sb.append("This is a long text for testing encryption performance. ");
        }
        String longText = sb.toString();

        // When
        String encrypted = encryptionService.encrypt(longText);
        String decrypted = encryptionService.decrypt(encrypted);

        // Then
        assertEquals(longText, decrypted);
        assertTrue(encrypted.length() > longText.length()); // Should be longer due to IV and encoding
    }

    @Test
    @DisplayName("Should use proper IV format in encrypted data")
    void shouldUseProperIVFormatInEncryptedData() {
        // Given
        String plaintext = "test@example.com";

        // When
        String encrypted = encryptionService.encrypt(plaintext);

        // Then
        String[] parts = encrypted.split(":");
        assertEquals(2, parts.length);
        
        // IV should be 12 bytes = 16 characters when base64 encoded
        String ivPart = parts[0];
        assertTrue(ivPart.length() >= 16); // Base64 encoding of 12 bytes
    }

    @Test
    @DisplayName("Should be deterministic with same master key")
    void shouldBeDeterministicWithSameMasterKey() {
        // Given
        EncryptionService service1 = new EncryptionService();
        EncryptionService service2 = new EncryptionService();
        ReflectionTestUtils.setField(service1, "masterKeyString", "sameMasterKey123456789012345678901234");
        ReflectionTestUtils.setField(service2, "masterKeyString", "sameMasterKey123456789012345678901234");
        
        String plaintext = "test@example.com";

        // When
        String encrypted1 = service1.encrypt(plaintext);
        String decrypted2 = service2.decrypt(encrypted1);

        // Then - service2 should be able to decrypt service1's encryption
        assertEquals(plaintext, decrypted2);
    }

    @Test
    @DisplayName("Should fail decryption with different master key")
    void shouldFailDecryptionWithDifferentMasterKey() {
        // Given
        EncryptionService service1 = new EncryptionService();
        EncryptionService service2 = new EncryptionService();
        ReflectionTestUtils.setField(service1, "masterKeyString", "masterKey1234567890123456789012345678");
        ReflectionTestUtils.setField(service2, "masterKeyString", "differentKey123456789012345678901234");
        
        String plaintext = "test@example.com";
        String encrypted = service1.encrypt(plaintext);

        // When & Then - service2 should fail to decrypt with different key
        assertThrows(RuntimeException.class, () -> service2.decrypt(encrypted));
    }

    @Test
    @DisplayName("Should handle whitespace-only input")
    void shouldHandleWhitespaceOnlyInput() {
        // Given
        String whitespaceOnly = "   \t\n  ";

        // When
        String encrypted = encryptionService.encrypt(whitespaceOnly);
        String decrypted = encryptionService.decrypt(encrypted);

        // Then
        assertEquals(whitespaceOnly, decrypted);
    }
}