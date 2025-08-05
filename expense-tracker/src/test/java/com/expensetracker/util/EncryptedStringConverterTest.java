package com.expensetracker.util;

import com.expensetracker.service.EncryptionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("EncryptedStringConverter Tests")
public class EncryptedStringConverterTest {

    @Mock
    private EncryptionService encryptionService;

    private EncryptedStringConverter converter;

    @BeforeEach
    void setUp() {
        converter = new EncryptedStringConverter();
        ReflectionTestUtils.setField(converter, "encryptionService", encryptionService);
    }

    @Test
    @DisplayName("Should encrypt attribute when converting to database column")
    void whenConvertToDatabaseColumn_thenEncryptAttribute() {
        // Given
        String plaintext = "test@example.com";
        String encrypted = "encryptedValue:withIV";
        when(encryptionService.encrypt(plaintext)).thenReturn(encrypted);

        // When
        String result = converter.convertToDatabaseColumn(plaintext);

        // Then
        assertThat(result).isEqualTo(encrypted);
        verify(encryptionService).encrypt(plaintext);
    }

    @Test
    @DisplayName("Should decrypt database data when converting to entity attribute")
    void whenConvertToEntityAttribute_thenDecryptData() {
        // Given
        String encrypted = "encryptedValue:withIV";
        String plaintext = "test@example.com";
        when(encryptionService.decrypt(encrypted)).thenReturn(plaintext);

        // When
        String result = converter.convertToEntityAttribute(encrypted);

        // Then
        assertThat(result).isEqualTo(plaintext);
        verify(encryptionService).decrypt(encrypted);
    }

    @Test
    @DisplayName("Should handle null values gracefully for database column")
    void whenConvertNullToDatabaseColumn_thenReturnNull() {
        // Given
        when(encryptionService.encrypt(null)).thenReturn(null);
        
        // When
        String result = converter.convertToDatabaseColumn(null);

        // Then
        assertThat(result).isNull();
        verify(encryptionService).encrypt(null);
    }

    @Test
    @DisplayName("Should handle null values gracefully for entity attribute")
    void whenConvertNullToEntityAttribute_thenReturnNull() {
        // Given
        when(encryptionService.decrypt(null)).thenReturn(null);
        
        // When
        String result = converter.convertToEntityAttribute(null);

        // Then
        assertThat(result).isNull();
        verify(encryptionService).decrypt(null);
    }

    @Test
    @DisplayName("Should handle empty string for database column")
    void whenConvertEmptyStringToDatabaseColumn_thenEncrypt() {
        // Given
        String empty = "";
        String encrypted = "encrypted:empty";
        when(encryptionService.encrypt(empty)).thenReturn(encrypted);

        // When
        String result = converter.convertToDatabaseColumn(empty);

        // Then
        assertThat(result).isEqualTo(encrypted);
        verify(encryptionService).encrypt(empty);
    }

    @Test
    @DisplayName("Should handle empty string for entity attribute")
    void whenConvertEmptyStringToEntityAttribute_thenDecrypt() {
        // Given
        String encrypted = "encrypted:empty";
        String empty = "";
        when(encryptionService.decrypt(encrypted)).thenReturn(empty);

        // When
        String result = converter.convertToEntityAttribute(encrypted);

        // Then
        assertThat(result).isEqualTo(empty);
        verify(encryptionService).decrypt(encrypted);
    }


    @Test
    @DisplayName("Should handle various email formats")
    void whenConvertVariousEmailFormats_thenEncryptDecryptCorrectly() {
        // Given
        String[] emails = {
            "simple@example.com",
            "user.name@domain.co.uk",
            "user+tag@example.org",
            "user.with-dash@sub.domain.com"
        };

        for (String email : emails) {
            String encrypted = "encrypted:" + email;
            when(encryptionService.encrypt(email)).thenReturn(encrypted);
            when(encryptionService.decrypt(encrypted)).thenReturn(email);

            // When
            String encryptResult = converter.convertToDatabaseColumn(email);
            String decryptResult = converter.convertToEntityAttribute(encryptResult);

            // Then
            assertThat(encryptResult).isEqualTo(encrypted);
            assertThat(decryptResult).isEqualTo(email);
        }
    }

    @Test
    @DisplayName("Should handle special characters in email")
    void whenConvertEmailWithSpecialChars_thenEncryptDecryptCorrectly() {
        // Given
        String emailWithSpecialChars = "user+test.tag@domain-name.co.uk";
        String encrypted = "encrypted:special";
        when(encryptionService.encrypt(emailWithSpecialChars)).thenReturn(encrypted);
        when(encryptionService.decrypt(encrypted)).thenReturn(emailWithSpecialChars);

        // When
        String encryptResult = converter.convertToDatabaseColumn(emailWithSpecialChars);
        String decryptResult = converter.convertToEntityAttribute(encryptResult);

        // Then
        assertThat(encryptResult).isEqualTo(encrypted);
        assertThat(decryptResult).isEqualTo(emailWithSpecialChars);
        verify(encryptionService).encrypt(emailWithSpecialChars);
        verify(encryptionService).decrypt(encrypted);
    }

    @Test
    @DisplayName("Should handle Unicode characters")
    void whenConvertUnicodeText_thenEncryptDecryptCorrectly() {
        // Given
        String unicodeEmail = "用户@测试域.中国";
        String encrypted = "encrypted:unicode";
        when(encryptionService.encrypt(unicodeEmail)).thenReturn(encrypted);
        when(encryptionService.decrypt(encrypted)).thenReturn(unicodeEmail);

        // When
        String encryptResult = converter.convertToDatabaseColumn(unicodeEmail);
        String decryptResult = converter.convertToEntityAttribute(encryptResult);

        // Then
        assertThat(encryptResult).isEqualTo(encrypted);
        assertThat(decryptResult).isEqualTo(unicodeEmail);
    }

    @Test
    @DisplayName("Should handle long text values")
    void whenConvertLongText_thenEncryptDecryptCorrectly() {
        // Given
        String longEmail = "very.very.long.email.address.with.multiple.parts@subdomain.example.domain.com";
        String encrypted = "encrypted:long";
        when(encryptionService.encrypt(longEmail)).thenReturn(encrypted);
        when(encryptionService.decrypt(encrypted)).thenReturn(longEmail);

        // When
        String encryptResult = converter.convertToDatabaseColumn(longEmail);
        String decryptResult = converter.convertToEntityAttribute(encryptResult);

        // Then
        assertThat(encryptResult).isEqualTo(encrypted);
        assertThat(decryptResult).isEqualTo(longEmail);
    }
}