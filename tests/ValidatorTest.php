<?php
/**
 * Tests unitaires pour la classe Validator
 * Tests de validation et sanitisation des données
 */

use PHPUnit\Framework\TestCase;

class ValidatorTest extends TestCase
{
    /**
     * Test de sanitizeString avec des données normales
     */
    public function testSanitizeStringWithNormalInput()
    {
        $input = "Hello World";
        $result = Validator::sanitizeString($input);
        
        $this->assertEquals("Hello World", $result);
    }

    /**
     * Test de sanitizeString avec des espaces
     */
    public function testSanitizeStringTrimsSpaces()
    {
        $input = "  Hello World  ";
        $result = Validator::sanitizeString($input);
        
        $this->assertEquals("Hello World", $result);
    }

    /**
     * Test de sanitizeString avec des caractères HTML
     */
    public function testSanitizeStringEscapesHtml()
    {
        $input = "<script>alert('XSS')</script>";
        $result = Validator::sanitizeString($input);
        
        $this->assertStringContainsString("&lt;", $result);
        $this->assertStringContainsString("&gt;", $result);
        $this->assertStringNotContainsString("<script>", $result);
    }

    /**
     * Test de sanitizeString avec des guillemets
     */
    public function testSanitizeStringEscapesQuotes()
    {
        $input = "Test avec 'guillemets' et \"doubles\"";
        $result = Validator::sanitizeString($input);
        
        // htmlspecialchars avec ENT_QUOTES convertit les guillemets
        $this->assertStringNotContainsString("'", $result);
        $this->assertStringNotContainsString('"', $result);
    }

    /**
     * Test de sanitizeString avec une chaîne vide
     */
    public function testSanitizeStringWithEmptyString()
    {
        $input = "";
        $result = Validator::sanitizeString($input);
        
        $this->assertEquals("", $result);
    }

    /**
     * Test de sanitizeString avec null converti en string
     */
    public function testSanitizeStringWithNullString()
    {
        $input = "";
        $result = Validator::sanitizeString($input);
        
        $this->assertEquals("", $result);
    }

    /**
     * Test de validateEmail avec un email valide
     */
    public function testValidateEmailWithValidEmail()
    {
        $this->assertTrue(Validator::validateEmail("test@example.com"));
        $this->assertTrue(Validator::validateEmail("user.name@domain.fr"));
        $this->assertTrue(Validator::validateEmail("user+tag@subdomain.example.com"));
    }

    /**
     * Test de validateEmail avec un email invalide
     */
    public function testValidateEmailWithInvalidEmail()
    {
        $this->assertFalse(Validator::validateEmail("plaintext"));
        $this->assertFalse(Validator::validateEmail("@example.com"));
        $this->assertFalse(Validator::validateEmail("user@"));
        $this->assertFalse(Validator::validateEmail("user@@example.com"));
        $this->assertFalse(Validator::validateEmail("user..name@example.com"));
    }

    /**
     * Test de validateEmail avec une chaîne vide
     */
    public function testValidateEmailWithEmptyString()
    {
        $this->assertFalse(Validator::validateEmail(""));
    }

    /**
     * Test de validatePhone avec un numéro français valide
     */
    public function testValidatePhoneWithValidFrenchNumber()
    {
        $this->assertTrue(Validator::validatePhone("0612345678"));
        $this->assertTrue(Validator::validatePhone("01 23 45 67 89"));
        $this->assertTrue(Validator::validatePhone("+33612345678"));
        $this->assertTrue(Validator::validatePhone("+33 6 12 34 56 78"));
    }

    /**
     * Test de validatePhone avec un numéro invalide
     */
    public function testValidatePhoneWithInvalidNumber()
    {
        $this->assertFalse(Validator::validatePhone("123"));
        $this->assertFalse(Validator::validatePhone("abcdefghij"));
        $this->assertFalse(Validator::validatePhone(""));
    }

    /**
     * Test de validatePassword avec un mot de passe valide
     */
    public function testValidatePasswordWithValidPassword()
    {
        // Doit contenir au moins 8 caractères
        $result1 = Validator::validatePassword("Password123");
        $this->assertTrue($result1['valid']);
        $this->assertEmpty($result1['errors']);
        
        $result2 = Validator::validatePassword("Secure@Pass1");
        $this->assertTrue($result2['valid']);
        
        $result3 = Validator::validatePassword("MyP@ssw0rd");
        $this->assertTrue($result3['valid']);
    }

    /**
     * Test de validatePassword avec un mot de passe trop court
     */
    public function testValidatePasswordWithShortPassword()
    {
        $result1 = Validator::validatePassword("Pass1");
        $this->assertFalse($result1['valid']);
        $this->assertNotEmpty($result1['errors']);
        
        $result2 = Validator::validatePassword("1234567");
        $this->assertFalse($result2['valid']);
    }

    /**
     * Test de validatePassword avec un mot de passe sans chiffre
     */
    public function testValidatePasswordWithoutNumber()
    {
        // Selon l'implémentation, peut nécessiter un chiffre
        $result = Validator::validatePassword("PasswordOnly");
        $this->assertFalse($result['valid']);
        $this->assertNotEmpty($result['errors']);
    }

    /**
     * Test de validatePassword avec une chaîne vide
     */
    public function testValidatePasswordWithEmptyString()
    {
        $result = Validator::validatePassword("");
        $this->assertFalse($result['valid']);
        $this->assertNotEmpty($result['errors']);
    }

    /**
     * Test d'intégration : validation d'un formulaire complet
     */
    public function testCompleteFormValidation()
    {
        $nom = Validator::sanitizeString("Dupont");
        $prenom = Validator::sanitizeString("Jean");
        $email = "jean.dupont@example.com";
        $tel = "0612345678";
        $password = "SecurePass123";

        $this->assertEquals("Dupont", $nom);
        $this->assertEquals("Jean", $prenom);
        $this->assertTrue(Validator::validateEmail($email));
        $this->assertTrue(Validator::validatePhone($tel));
        
        $passwordResult = Validator::validatePassword($password);
        $this->assertTrue($passwordResult['valid']);
    }

    /**
     * Test de protection XSS
     */
    public function testXssProtection()
    {
        $maliciousInput = "<img src=x onerror=alert('XSS')>";
        $sanitized = Validator::sanitizeString($maliciousInput);
        
        // Les balises HTML doivent être échappées
        $this->assertStringContainsString("&lt;", $sanitized);
        $this->assertStringContainsString("&gt;", $sanitized);
        $this->assertStringNotContainsString("<img", $sanitized);
    }

    /**
     * Test de protection contre l'injection SQL (caractères spéciaux)
     */
    public function testSqlInjectionCharacters()
    {
        $maliciousInput = "'; DROP TABLE users; --";
        $sanitized = Validator::sanitizeString($maliciousInput);
        
        // Les guillemets devraient être échappés
        $this->assertStringNotContainsString("'", $sanitized);
    }
}
