package com.expensetracker.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

@ActiveProfiles("test")
class EncryptionServiceEdgeCaseTest {

    private EncryptionService encryptionService;

    @BeforeEach
    void setUp() {
        encryptionService = new EncryptionService();
        ReflectionTestUtils.setField(encryptionService, "masterKeyString", "testKey123456789012345678901234567890");
    }

    @Test
    @DisplayName("Should handle single character encryption")
    void shouldHandleSingleCharacterEncryption() {
        // Given
        String singleChar = "A";

        // When
        String encrypted = encryptionService.encrypt(singleChar);
        String decrypted = encryptionService.decrypt(encrypted);

        // Then
        assertEquals(singleChar, decrypted);
        assertTrue(encrypted.contains(":"));
    }

    @Test
    @DisplayName("Should handle numeric string encryption")
    void shouldHandleNumericStringEncryption() {
        // Given
        String numbers = "1234567890";

        // When
        String encrypted = encryptionService.encrypt(numbers);
        String decrypted = encryptionService.decrypt(encrypted);

        // Then
        assertEquals(numbers, decrypted);
    }

    @Test
    @DisplayName("Should handle space-only string")
    void shouldHandleSpaceOnlyString() {
        // Given
        String spaces = "     ";

        // When
        String encrypted = encryptionService.encrypt(spaces);
        String decrypted = encryptionService.decrypt(encrypted);

        // Then
        assertEquals(spaces, decrypted);
    }

    @Test
    @DisplayName("Should handle malformed encrypted data with multiple separators")
    void shouldHandleMalformedEncryptedDataWithMultipleSeparators() {
        // Given
        String malformed = "part1:part2:part3";

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> encryptionService.decrypt(malformed));
        
        assertTrue(exception.getMessage().contains("Error decrypting data"));
    }

    @Test
    @DisplayName("Should handle empty IV part")
    void shouldHandleEmptyIvPart() {
        // Given
        String emptyIv = ":validciphertext";

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> encryptionService.decrypt(emptyIv));
        
        assertTrue(exception.getMessage().contains("Error decrypting data"));
    }

    @Test
    @DisplayName("Should handle empty ciphertext part")
    void shouldHandleEmptyCiphertextPart() {
        // Given
        String emptyCiphertext = "validiv:";

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> encryptionService.decrypt(emptyCiphertext));
        
        assertTrue(exception.getMessage().contains("Error decrypting data"));
    }

    @Test
    @DisplayName("Should handle very short master key")
    void shouldHandleVeryShortMasterKey() {
        // Given
        EncryptionService shortKeyService = new EncryptionService();
        ReflectionTestUtils.setField(shortKeyService, "masterKeyString", "short");
        String plaintext = "test";

        // When
        String encrypted = shortKeyService.encrypt(plaintext);
        String decrypted = shortKeyService.decrypt(encrypted);

        // Then
        assertEquals(plaintext, decrypted);
    }

    @Test
    @DisplayName("Should handle very long master key")
    void shouldHandleVeryLongMasterKey() {
        // Given
        EncryptionService longKeyService = new EncryptionService();
        StringBuilder longKey = new StringBuilder();
        for (int i = 0; i < 100; i++) {
            longKey.append("verylongkey");
        }
        ReflectionTestUtils.setField(longKeyService, "masterKeyString", longKey.toString());
        String plaintext = "test";

        // When
        String encrypted = longKeyService.encrypt(plaintext);
        String decrypted = longKeyService.decrypt(encrypted);

        // Then
        assertEquals(plaintext, decrypted);
    }

    @Test
    @DisplayName("Should handle binary-like data")
    void shouldHandleBinaryLikeData() {
        // Given
        String binaryLike = "\u0001\u0002\u0003\u0004\u0005";

        // When
        String encrypted = encryptionService.encrypt(binaryLike);
        String decrypted = encryptionService.decrypt(encrypted);

        // Then
        assertEquals(binaryLike, decrypted);
    }

    @Test
    @DisplayName("Should handle text with newlines and tabs")
    void shouldHandleTextWithNewlinesAndTabs() {
        // Given
        String textWithFormatting = "Line 1\nLine 2\tTabbed\r\nWindows line";

        // When
        String encrypted = encryptionService.encrypt(textWithFormatting);
        String decrypted = encryptionService.decrypt(encrypted);

        // Then
        assertEquals(textWithFormatting, decrypted);
    }

    @Test
    @DisplayName("Should handle JSON-like string")
    void shouldHandleJsonLikeString() {
        // Given
        String json = "{\"user\":{\"email\":\"test@example.com\",\"data\":[1,2,3]}}";

        // When
        String encrypted = encryptionService.encrypt(json);
        String decrypted = encryptionService.decrypt(encrypted);

        // Then
        assertEquals(json, decrypted);
    }

    @Test
    @DisplayName("Should handle URL-like string")
    void shouldHandleUrlLikeString() {
        // Given
        String url = "https://example.com:8080/path?param1=value1&param2=value2#fragment";

        // When
        String encrypted = encryptionService.encrypt(url);
        String decrypted = encryptionService.decrypt(encrypted);

        // Then
        assertEquals(url, decrypted);
    }

    @Test
    @DisplayName("Should handle SQL-like string")
    void shouldHandleSqlLikeString() {
        // Given
        String sql = "SELECT * FROM users WHERE email = 'test@example.com' AND active = 1;";

        // When
        String encrypted = encryptionService.encrypt(sql);
        String decrypted = encryptionService.decrypt(encrypted);

        // Then
        assertEquals(sql, decrypted);
    }
}