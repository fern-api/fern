package com.fern.java.utils;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.List;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

public class CasingConfigurationTest {

    // ===== splitWords =====

    @Nested
    class SplitWordsTests {

        @Test
        void splitWords_camelCase() {
            assertThat(CasingConfiguration.splitWords("userId")).containsExactly("user", "Id");
        }

        @Test
        void splitWords_pascalCase() {
            assertThat(CasingConfiguration.splitWords("UserId")).containsExactly("User", "Id");
        }

        @Test
        void splitWords_allCaps() {
            assertThat(CasingConfiguration.splitWords("HTTP")).containsExactly("HTTP");
        }

        @Test
        void splitWords_allCapsFollowedByLower() {
            assertThat(CasingConfiguration.splitWords("HTTPSClient")).containsExactly("HTTPS", "Client");
        }

        @Test
        void splitWords_singleChar() {
            assertThat(CasingConfiguration.splitWords("A")).containsExactly("A");
        }

        @Test
        void splitWords_singleLowerChar() {
            assertThat(CasingConfiguration.splitWords("a")).containsExactly("a");
        }

        @Test
        void splitWords_mixed() {
            assertThat(CasingConfiguration.splitWords("ABCDef")).containsExactly("ABC", "Def");
        }

        @Test
        void splitWords_twoCaps() {
            assertThat(CasingConfiguration.splitWords("AB")).containsExactly("AB");
        }

        @Test
        void splitWords_AValue() {
            assertThat(CasingConfiguration.splitWords("AValue")).containsExactly("A", "Value");
        }

        @Test
        void splitWords_XMLParser() {
            assertThat(CasingConfiguration.splitWords("XMLParser")).containsExactly("XML", "Parser");
        }

        @Test
        void splitWords_withNumbers() {
            assertThat(CasingConfiguration.splitWords("test123")).containsExactly("test", "123");
        }

        @Test
        void splitWords_numbersOnly() {
            assertThat(CasingConfiguration.splitWords("123")).containsExactly("123");
        }

        @Test
        void splitWords_v2() {
            assertThat(CasingConfiguration.splitWords("v2")).containsExactly("v", "2");
        }

        @Test
        void splitWords_applicationV1() {
            assertThat(CasingConfiguration.splitWords("applicationV1")).containsExactly("application", "V", "1");
        }

        @Test
        void splitWords_emptyString() {
            assertThat(CasingConfiguration.splitWords("")).isEmpty();
        }

        @Test
        void splitWords_null() {
            assertThat(CasingConfiguration.splitWords(null)).isEmpty();
        }

        @Test
        void splitWords_onlySpecialChars() {
            // underscores and hyphens are not matched by the pattern
            assertThat(CasingConfiguration.splitWords("___")).isEmpty();
        }

        @Test
        void splitWords_snakeCase() {
            assertThat(CasingConfiguration.splitWords("user_id")).containsExactly("user", "id");
        }

        @Test
        void splitWords_ec2() {
            assertThat(CasingConfiguration.splitWords("ec2")).containsExactly("ec", "2");
        }

        @Test
        void splitWords_test2This2() {
            assertThat(CasingConfiguration.splitWords("test2This2")).containsExactly("test", "2", "This", "2");
        }
    }

    // ===== toCamelCase =====

    @Nested
    class ToCamelCaseTests {

        @Test
        void toCamelCase_pascalCase() {
            assertThat(CasingConfiguration.toCamelCase("UserId")).isEqualTo("userId");
        }

        @Test
        void toCamelCase_alreadyCamel() {
            assertThat(CasingConfiguration.toCamelCase("userId")).isEqualTo("userId");
        }

        @Test
        void toCamelCase_allCaps() {
            assertThat(CasingConfiguration.toCamelCase("HTTP")).isEqualTo("http");
        }

        @Test
        void toCamelCase_mixed() {
            assertThat(CasingConfiguration.toCamelCase("HTTPSClient")).isEqualTo("httpsClient");
        }

        @Test
        void toCamelCase_snakeCase() {
            assertThat(CasingConfiguration.toCamelCase("user_id")).isEqualTo("userId");
        }

        @Test
        void toCamelCase_singleWord() {
            assertThat(CasingConfiguration.toCamelCase("hello")).isEqualTo("hello");
        }

        @Test
        void toCamelCase_empty() {
            assertThat(CasingConfiguration.toCamelCase("")).isEqualTo("");
        }

        @Test
        void toCamelCase_singleUpperChar() {
            assertThat(CasingConfiguration.toCamelCase("A")).isEqualTo("a");
        }

        @Test
        void toCamelCase_withNumbers() {
            assertThat(CasingConfiguration.toCamelCase("test123Value")).isEqualTo("test123Value");
        }
    }

    // ===== toPascalCase =====

    @Nested
    class ToPascalCaseTests {

        @Test
        void toPascalCase_camelCase() {
            assertThat(CasingConfiguration.toPascalCase("userId")).isEqualTo("UserId");
        }

        @Test
        void toPascalCase_alreadyPascal() {
            assertThat(CasingConfiguration.toPascalCase("UserId")).isEqualTo("UserId");
        }

        @Test
        void toPascalCase_allCaps() {
            assertThat(CasingConfiguration.toPascalCase("HTTP")).isEqualTo("Http");
        }

        @Test
        void toPascalCase_mixed() {
            assertThat(CasingConfiguration.toPascalCase("HTTPSClient")).isEqualTo("HttpsClient");
        }

        @Test
        void toPascalCase_snakeCase() {
            assertThat(CasingConfiguration.toPascalCase("user_id")).isEqualTo("UserId");
        }

        @Test
        void toPascalCase_empty() {
            assertThat(CasingConfiguration.toPascalCase("")).isEqualTo("");
        }

        @Test
        void toPascalCase_singleLowerChar() {
            assertThat(CasingConfiguration.toPascalCase("a")).isEqualTo("A");
        }
    }

    // ===== toBasicSnakeCase =====

    @Nested
    class ToBasicSnakeCaseTests {

        @Test
        void toBasicSnakeCase_camelCase() {
            assertThat(CasingConfiguration.toBasicSnakeCase("userId")).isEqualTo("user_id");
        }

        @Test
        void toBasicSnakeCase_pascalCase() {
            assertThat(CasingConfiguration.toBasicSnakeCase("UserId")).isEqualTo("user_id");
        }

        @Test
        void toBasicSnakeCase_alreadySnake() {
            assertThat(CasingConfiguration.toBasicSnakeCase("user_id")).isEqualTo("user_id");
        }

        @Test
        void toBasicSnakeCase_allCaps() {
            assertThat(CasingConfiguration.toBasicSnakeCase("HTTP")).isEqualTo("http");
        }

        @Test
        void toBasicSnakeCase_v2() {
            assertThat(CasingConfiguration.toBasicSnakeCase("v2")).isEqualTo("v_2");
        }

        @Test
        void toBasicSnakeCase_ec2() {
            assertThat(CasingConfiguration.toBasicSnakeCase("ec2")).isEqualTo("ec_2");
        }

        @Test
        void toBasicSnakeCase_empty() {
            assertThat(CasingConfiguration.toBasicSnakeCase("")).isEqualTo("");
        }
    }

    // ===== toSmartSnakeCase =====

    @Nested
    class ToSmartSnakeCaseTests {

        @Test
        void toSmartSnakeCase_v2() {
            assertThat(CasingConfiguration.toSmartSnakeCase("v2")).isEqualTo("v2");
        }

        @Test
        void toSmartSnakeCase_ec2() {
            assertThat(CasingConfiguration.toSmartSnakeCase("ec2")).isEqualTo("ec2");
        }

        @Test
        void toSmartSnakeCase_applicationV1() {
            assertThat(CasingConfiguration.toSmartSnakeCase("applicationV1")).isEqualTo("application_v1");
        }

        @Test
        void toSmartSnakeCase_test2This2() {
            // "test2This2" -> splitByDigits: "test", "2", "This", "2"
            // non-digit parts: basicSnake("test") = "test", basicSnake("This") = "this"
            // result: "test2this2"
            assertThat(CasingConfiguration.toSmartSnakeCase("test2This2")).isEqualTo("test2this2");
        }

        @Test
        void toSmartSnakeCase_test2This2_2v22() {
            // "test2This2 2v22" -> space split: ["test2This2", "2v22"]
            // "test2This2" -> "test2this2"
            // "2v22" -> splitByDigits: "2", "v", "22" -> "2v22"
            // join with "_": "test2this2_2v22"
            assertThat(CasingConfiguration.toSmartSnakeCase("test2This2 2v22")).isEqualTo("test2this2_2v22");
        }

        @Test
        void toSmartSnakeCase_simpleWord() {
            assertThat(CasingConfiguration.toSmartSnakeCase("hello")).isEqualTo("hello");
        }

        @Test
        void toSmartSnakeCase_camelCase() {
            assertThat(CasingConfiguration.toSmartSnakeCase("helloWorld")).isEqualTo("hello_world");
        }

        @Test
        void toSmartSnakeCase_withSpaces() {
            assertThat(CasingConfiguration.toSmartSnakeCase("hello world")).isEqualTo("hello_world");
        }

        @Test
        void toSmartSnakeCase_numbersOnly() {
            assertThat(CasingConfiguration.toSmartSnakeCase("123")).isEqualTo("123");
        }
    }

    // ===== splitByDigits =====

    @Nested
    class SplitByDigitsTests {

        @Test
        void splitByDigits_noDigits() {
            assertThat(CasingConfiguration.splitByDigits("hello")).containsExactly("hello");
        }

        @Test
        void splitByDigits_onlyDigits() {
            assertThat(CasingConfiguration.splitByDigits("123")).containsExactly("123");
        }

        @Test
        void splitByDigits_mixed() {
            assertThat(CasingConfiguration.splitByDigits("v2")).containsExactly("v", "2");
        }

        @Test
        void splitByDigits_complexMixed() {
            assertThat(CasingConfiguration.splitByDigits("test123value456"))
                    .containsExactly("test", "123", "value", "456");
        }

        @Test
        void splitByDigits_empty() {
            assertThat(CasingConfiguration.splitByDigits("")).isEmpty();
        }

        @Test
        void splitByDigits_leadingDigits() {
            assertThat(CasingConfiguration.splitByDigits("2v")).containsExactly("2", "v");
        }
    }

    // ===== upperFirst =====

    @Nested
    class UpperFirstTests {

        @Test
        void upperFirst_lowercase() {
            assertThat(CasingConfiguration.upperFirst("hello")).isEqualTo("Hello");
        }

        @Test
        void upperFirst_alreadyUpper() {
            assertThat(CasingConfiguration.upperFirst("Hello")).isEqualTo("Hello");
        }

        @Test
        void upperFirst_singleChar() {
            assertThat(CasingConfiguration.upperFirst("a")).isEqualTo("A");
        }

        @Test
        void upperFirst_empty() {
            assertThat(CasingConfiguration.upperFirst("")).isEqualTo("");
        }

        @Test
        void upperFirst_null() {
            assertThat(CasingConfiguration.upperFirst(null)).isNull();
        }
    }

    // ===== computeName (full integration) =====

    @Nested
    class ComputeNameTests {

        // --- Basic casing (smartCasing=false, no language, no keywords) ---

        @Test
        void computeName_basic_normalName() {
            CasingConfiguration config = buildConfig(false, null, null);
            CasingConfiguration.NameParts parts = config.computeName("normalName");

            assertThat(parts.originalName).isEqualTo("normalName");
            assertThat(parts.camelUnsafe).isEqualTo("normalName");
            assertThat(parts.pascalUnsafe).isEqualTo("NormalName");
            assertThat(parts.snakeUnsafe).isEqualTo("normal_name");
            assertThat(parts.screamingSnakeUnsafe).isEqualTo("NORMAL_NAME");
        }

        @Test
        void computeName_basic_userId() {
            CasingConfiguration config = buildConfig(false, null, null);
            CasingConfiguration.NameParts parts = config.computeName("userId");

            assertThat(parts.originalName).isEqualTo("userId");
            assertThat(parts.camelUnsafe).isEqualTo("userId");
            assertThat(parts.pascalUnsafe).isEqualTo("UserId");
            assertThat(parts.snakeUnsafe).isEqualTo("user_id");
            assertThat(parts.screamingSnakeUnsafe).isEqualTo("USER_ID");
        }

        @Test
        void computeName_basic_PascalInput() {
            CasingConfiguration config = buildConfig(false, null, null);
            CasingConfiguration.NameParts parts = config.computeName("UserId");

            assertThat(parts.camelUnsafe).isEqualTo("userId");
            assertThat(parts.pascalUnsafe).isEqualTo("UserId");
            assertThat(parts.snakeUnsafe).isEqualTo("user_id");
        }

        @Test
        void computeName_basic_allCaps() {
            CasingConfiguration config = buildConfig(false, null, null);
            CasingConfiguration.NameParts parts = config.computeName("HTTP");

            assertThat(parts.camelUnsafe).isEqualTo("http");
            assertThat(parts.pascalUnsafe).isEqualTo("Http");
            assertThat(parts.snakeUnsafe).isEqualTo("http");
        }

        @Test
        void computeName_basic_v2_noSmartCasing() {
            CasingConfiguration config = buildConfig(false, null, null);
            CasingConfiguration.NameParts parts = config.computeName("v2");

            // Without smartCasing, basicSnakeCase splits "v" and "2"
            assertThat(parts.snakeUnsafe).isEqualTo("v_2");
            assertThat(parts.screamingSnakeUnsafe).isEqualTo("V_2");
        }

        // --- smartCasing (no language = initialism capitalization ON by default) ---

        @Test
        void computeName_smart_v2() {
            CasingConfiguration config = buildConfig(true, null, null);
            CasingConfiguration.NameParts parts = config.computeName("v2");

            // smartCasing keeps numbers adjacent: "v2" not "v_2"
            assertThat(parts.snakeUnsafe).isEqualTo("v2");
            assertThat(parts.screamingSnakeUnsafe).isEqualTo("V2");
        }

        @Test
        void computeName_smart_ec2() {
            CasingConfiguration config = buildConfig(true, null, null);
            CasingConfiguration.NameParts parts = config.computeName("ec2");

            assertThat(parts.snakeUnsafe).isEqualTo("ec2");
            assertThat(parts.screamingSnakeUnsafe).isEqualTo("EC2");
        }

        @Test
        void computeName_smart_applicationV1() {
            CasingConfiguration config = buildConfig(true, null, null);
            CasingConfiguration.NameParts parts = config.computeName("applicationV1");

            assertThat(parts.snakeUnsafe).isEqualTo("application_v1");
            assertThat(parts.screamingSnakeUnsafe).isEqualTo("APPLICATION_V1");
        }

        @Test
        void computeName_smart_test2This2_2v22() {
            CasingConfiguration config = buildConfig(true, null, null);
            CasingConfiguration.NameParts parts = config.computeName("test2This2 2v22");

            assertThat(parts.snakeUnsafe).isEqualTo("test2this2_2v22");
        }

        // --- smartCasing + initialism capitalization (Go language) ---

        @Test
        void computeName_smartGo_userId() {
            CasingConfiguration config = buildConfig(true, "go", null);
            CasingConfiguration.NameParts parts = config.computeName("userId");

            // "Id" is a common initialism -> camelCase keeps first word, capitalizes "Id" -> "ID"
            assertThat(parts.camelUnsafe).isEqualTo("userID");
            assertThat(parts.pascalUnsafe).isEqualTo("UserID");
        }

        @Test
        void computeName_smartGo_httpClient() {
            CasingConfiguration config = buildConfig(true, "go", null);
            CasingConfiguration.NameParts parts = config.computeName("httpClient");

            // "Http" -> not at index 0 for camel => at index 1 "Client" is not initialism
            // splitWords("httpClient") = ["http", "Client"]
            // camelCase("httpClient") = "httpClient"
            // splitWords("httpClient") = ["http", "Client"]
            // index 0: "http" -> keep as-is (index 0 in camel)
            // index 1: "Client" -> not initialism -> keep
            // But "http" IS a common initialism (HTTP)
            // In camel: index 0 is kept as-is, only index > 0 gets uppercased
            assertThat(parts.camelUnsafe).isEqualTo("httpClient");
            assertThat(parts.pascalUnsafe).isEqualTo("HTTPClient");
        }

        @Test
        void computeName_smartGo_getHttpResponse() {
            CasingConfiguration config = buildConfig(true, "go", null);
            CasingConfiguration.NameParts parts = config.computeName("getHttpResponse");

            // camelCase("getHttpResponse") = "getHttpResponse"
            // words: ["get", "Http", "Response"]
            // index 0: "get" -> keep (not initialism at index 0)
            // index 1: "Http" -> isCommonInitialism("HTTP") = true -> "HTTP"
            // index 2: "Response" -> not initialism
            assertThat(parts.camelUnsafe).isEqualTo("getHTTPResponse");
            assertThat(parts.pascalUnsafe).isEqualTo("GetHTTPResponse");
        }

        @Test
        void computeName_smartGo_apiKey() {
            CasingConfiguration config = buildConfig(true, "go", null);
            CasingConfiguration.NameParts parts = config.computeName("apiKey");

            // camelCase("apiKey") = "apiKey"
            // words: ["api", "Key"]
            // index 0: "api" -> keep as-is in camel
            // index 1: "Key" -> not an initialism
            assertThat(parts.camelUnsafe).isEqualTo("apiKey");
            // pascal: index 0 "api" -> upperFirst("api") = "Api" -> isCommonInitialism("API") -> "API"
            assertThat(parts.pascalUnsafe).isEqualTo("APIKey");
        }

        @Test
        void computeName_smartGo_setClientId() {
            CasingConfiguration config = buildConfig(true, "go", null);
            CasingConfiguration.NameParts parts = config.computeName("setClientId");

            // camelCase("setClientId") = "setClientId"
            // words: ["set", "Client", "Id"]
            // index 0: "set" -> keep
            // index 1: "Client" -> not initialism
            // index 2: "Id" -> isCommonInitialism("ID") = true -> "ID"
            assertThat(parts.camelUnsafe).isEqualTo("setClientID");
            assertThat(parts.pascalUnsafe).isEqualTo("SetClientID");
        }

        @Test
        void computeName_smartGo_pluralInitialism_userIds() {
            CasingConfiguration config = buildConfig(true, "go", null);
            CasingConfiguration.NameParts parts = config.computeName("userIds");

            // camelCase("userIds") = "userIds"
            // words: ["user", "Ids"]
            // index 1: "Ids" -> maybeGetPluralInitialism("IDS") = "IDs"
            assertThat(parts.camelUnsafe).isEqualTo("userIDs");
            assertThat(parts.pascalUnsafe).isEqualTo("UserIDs");
        }

        @Test
        void computeName_smartGo_pluralInitialism_apiUuids() {
            CasingConfiguration config = buildConfig(true, "go", null);
            CasingConfiguration.NameParts parts = config.computeName("apiUuids");

            // camelCase("apiUuids") = "apiUuids"
            // words: ["api", "Uuids"]
            // Both "api" and "Uuids" are initialisms -> hasAdjacentCommonInitialisms = true
            // So NO initialism transformation is applied
            assertThat(parts.camelUnsafe).isEqualTo("apiUuids");
            assertThat(parts.pascalUnsafe).isEqualTo("ApiUuids");
        }

        @Test
        void computeName_smartGo_adjacentInitialisms_httpUrl() {
            CasingConfiguration config = buildConfig(true, "go", null);
            CasingConfiguration.NameParts parts = config.computeName("httpUrl");

            // camelCase("httpUrl") = "httpUrl"
            // words: ["http", "Url"]
            // "http" -> isCommonInitialism("HTTP") = true
            // "Url" -> isCommonInitialism("URL") = true
            // Adjacent initialisms -> skip transformation
            assertThat(parts.camelUnsafe).isEqualTo("httpUrl");
            assertThat(parts.pascalUnsafe).isEqualTo("HttpUrl");
        }

        // --- smartCasing + Ruby (also gets initialism capitalization) ---

        @Test
        void computeName_smartRuby_userId() {
            CasingConfiguration config = buildConfig(true, "ruby", null);
            CasingConfiguration.NameParts parts = config.computeName("userId");

            assertThat(parts.camelUnsafe).isEqualTo("userID");
            assertThat(parts.pascalUnsafe).isEqualTo("UserID");
        }

        // --- smartCasing + Java (no initialism capitalization) ---

        @Test
        void computeName_smartJava_userId() {
            CasingConfiguration config = buildConfig(true, "java", null);
            CasingConfiguration.NameParts parts = config.computeName("userId");

            // Java is NOT in CAPITALIZE_INITIALISM_LANGUAGES
            assertThat(parts.camelUnsafe).isEqualTo("userId");
            assertThat(parts.pascalUnsafe).isEqualTo("UserId");
        }

        @Test
        void computeName_smartJava_httpClient() {
            CasingConfiguration config = buildConfig(true, "java", null);
            CasingConfiguration.NameParts parts = config.computeName("httpClient");

            assertThat(parts.camelUnsafe).isEqualTo("httpClient");
            assertThat(parts.pascalUnsafe).isEqualTo("HttpClient");
        }

        // --- smartCasing + Python (no initialism capitalization) ---

        @Test
        void computeName_smartPython_userId() {
            CasingConfiguration config = buildConfig(true, "python", null);
            CasingConfiguration.NameParts parts = config.computeName("userId");

            assertThat(parts.camelUnsafe).isEqualTo("userId");
            assertThat(parts.pascalUnsafe).isEqualTo("UserId");
        }

        // --- Preprocessing ---

        @Test
        void computeName_arrayBrackets() {
            CasingConfiguration config = buildConfig(false, null, null);
            CasingConfiguration.NameParts parts = config.computeName("Integer[]");

            // "Integer[]" -> preprocessed to "IntegerArray"
            assertThat(parts.originalName).isEqualTo("Integer[]");
            assertThat(parts.camelUnsafe).isEqualTo("integerArray");
            assertThat(parts.pascalUnsafe).isEqualTo("IntegerArray");
            assertThat(parts.snakeUnsafe).isEqualTo("integer_array");
        }

        // --- Keyword sanitization ---

        @Test
        void computeName_javaKeyword_class() {
            CasingConfiguration config = buildConfig(false, "java", null);
            CasingConfiguration.NameParts parts = config.computeName("class");

            assertThat(parts.camelUnsafe).isEqualTo("class");
            assertThat(parts.camelSafe).isEqualTo("class_");
        }

        @Test
        void computeName_javaKeyword_return() {
            CasingConfiguration config = buildConfig(false, "java", null);
            CasingConfiguration.NameParts parts = config.computeName("return");

            assertThat(parts.camelUnsafe).isEqualTo("return");
            assertThat(parts.camelSafe).isEqualTo("return_");
        }

        @Test
        void computeName_javaKeyword_for() {
            CasingConfiguration config = buildConfig(false, "java", null);
            CasingConfiguration.NameParts parts = config.computeName("for");

            assertThat(parts.camelUnsafe).isEqualTo("for");
            assertThat(parts.camelSafe).isEqualTo("for_");
            assertThat(parts.pascalUnsafe).isEqualTo("For");
            // "For" is not a Java keyword, so safe == unsafe
            assertThat(parts.pascalSafe).isEqualTo("For");
        }

        @Test
        void computeName_nonKeyword() {
            CasingConfiguration config = buildConfig(false, "java", null);
            CasingConfiguration.NameParts parts = config.computeName("hello");

            assertThat(parts.camelUnsafe).isEqualTo("hello");
            assertThat(parts.camelSafe).isEqualTo("hello");
        }

        @Test
        void computeName_customKeywords() {
            CasingConfiguration config = buildConfig(false, null, List.of("foo", "bar"));
            CasingConfiguration.NameParts parts = config.computeName("foo");

            assertThat(parts.camelUnsafe).isEqualTo("foo");
            assertThat(parts.camelSafe).isEqualTo("foo_");
        }

        @Test
        void computeName_customKeywords_overrideDefaults() {
            // When keywords are provided explicitly, they override language defaults
            CasingConfiguration config = buildConfig(false, "java", List.of("myKeyword"));
            CasingConfiguration.NameParts parts = config.computeName("class");

            // "class" is NOT in the custom keywords list, so it should NOT be sanitized
            assertThat(parts.camelSafe).isEqualTo("class");
        }

        @Test
        void computeName_startsWithNumber() {
            CasingConfiguration config = buildConfig(false, "java", null);
            CasingConfiguration.NameParts parts = config.computeName("2xx");

            // "2xx" -> splitWords: ["2", "xx"] -> camelCase: "2Xx"
            // Wait, let's trace: splitWords("2xx") = ["2", "xx"]
            // toCamelCase: word 0 = "2" (lowercase -> "2"), word 1 = "xx" (upperFirst("xx") = "Xx")
            // -> "2Xx"... but actually toCamelCase lowercases each word first
            // word 0: "2".toLowerCase() = "2"
            // word 1: upperFirst("xx".toLowerCase()) = "Xx"
            // result: "2Xx"
            // Wait, let me re-check: word 1 is "xx", toLowerCase -> "xx", upperFirst -> "Xx"
            // But actually the regex: [A-Z]+(?=[A-Z][a-z])|[A-Z]?[a-z]+|[A-Z]+|[0-9]+
            // "2xx" matches [0-9]+ -> "2", then [A-Z]?[a-z]+ -> "xx"
            // toCamelCase: i=0 -> "2".toLowerCase()="2", i=1 -> upperFirst("xx")="Xx"
            // result: "2Xx" -> wait no, i=1 -> words.get(1).toLowerCase() then upperFirst
            // "xx".toLowerCase() = "xx", upperFirst("xx") = "Xx"
            // Final: "2Xx" -> Hmm that doesn't look right
            // Actually checking lodash camelCase("2xx") = "2Xx" - yes that's correct
            assertThat(parts.camelUnsafe).isEqualTo("2Xx");
            // starts with number -> safe adds "_" prefix
            assertThat(parts.camelSafe).isEqualTo("_2Xx");
        }

        @Test
        void computeName_noKeywords_noLanguage() {
            // When no keywords and no language, sanitization is a no-op
            CasingConfiguration config = buildConfig(false, null, null);
            CasingConfiguration.NameParts parts = config.computeName("class");

            assertThat(parts.camelUnsafe).isEqualTo("class");
            assertThat(parts.camelSafe).isEqualTo("class"); // no sanitization
        }

        // --- Edge cases ---

        @Test
        void computeName_singleChar() {
            CasingConfiguration config = buildConfig(false, null, null);
            CasingConfiguration.NameParts parts = config.computeName("a");

            assertThat(parts.camelUnsafe).isEqualTo("a");
            assertThat(parts.pascalUnsafe).isEqualTo("A");
            assertThat(parts.snakeUnsafe).isEqualTo("a");
            assertThat(parts.screamingSnakeUnsafe).isEqualTo("A");
        }

        @Test
        void computeName_originalNamePreserved() {
            CasingConfiguration config = buildConfig(false, null, null);
            CasingConfiguration.NameParts parts = config.computeName("MyOriginalName");

            assertThat(parts.originalName).isEqualTo("MyOriginalName");
        }
    }

    // ===== fromIrJson =====

    @Nested
    class FromIrJsonTests {

        private final ObjectMapper mapper = new ObjectMapper();

        @Test
        void fromIrJson_withCasingsConfig() {
            ObjectNode root = mapper.createObjectNode();
            ObjectNode casingsConfig = mapper.createObjectNode();
            casingsConfig.put("smartCasing", true);
            casingsConfig.put("generationLanguage", "go");
            casingsConfig.putArray("keywords").add("type").add("func");
            root.set("casingsConfig", casingsConfig);

            CasingConfiguration config = CasingConfiguration.fromIrJson(root);
            CasingConfiguration.NameParts parts = config.computeName("userId");

            // Go + smartCasing -> initialism capitalization
            assertThat(parts.camelUnsafe).isEqualTo("userID");
            assertThat(parts.pascalUnsafe).isEqualTo("UserID");
        }

        @Test
        void fromIrJson_withSmartCasingFalse() {
            ObjectNode root = mapper.createObjectNode();
            ObjectNode casingsConfig = mapper.createObjectNode();
            casingsConfig.put("smartCasing", false);
            root.set("casingsConfig", casingsConfig);

            CasingConfiguration config = CasingConfiguration.fromIrJson(root);
            CasingConfiguration.NameParts parts = config.computeName("v2");

            // smartCasing false -> basic snake_case -> "v_2"
            assertThat(parts.snakeUnsafe).isEqualTo("v_2");
        }

        @Test
        void fromIrJson_noCasingsConfig() {
            ObjectNode root = mapper.createObjectNode();

            CasingConfiguration config = CasingConfiguration.fromIrJson(root);
            CasingConfiguration.NameParts parts = config.computeName("v2");

            // Default smartCasing=true -> smart snake_case -> "v2"
            assertThat(parts.snakeUnsafe).isEqualTo("v2");
        }

        @Test
        void fromIrJson_nullCasingsConfig() {
            ObjectNode root = mapper.createObjectNode();
            root.putNull("casingsConfig");

            CasingConfiguration config = CasingConfiguration.fromIrJson(root);
            CasingConfiguration.NameParts parts = config.computeName("v2");

            // Default smartCasing=true
            assertThat(parts.snakeUnsafe).isEqualTo("v2");
        }

        @Test
        void fromIrJson_withKeywords() {
            ObjectNode root = mapper.createObjectNode();
            ObjectNode casingsConfig = mapper.createObjectNode();
            casingsConfig.put("smartCasing", false);
            casingsConfig.putArray("keywords").add("reserved");
            root.set("casingsConfig", casingsConfig);

            CasingConfiguration config = CasingConfiguration.fromIrJson(root);
            CasingConfiguration.NameParts parts = config.computeName("reserved");

            assertThat(parts.camelUnsafe).isEqualTo("reserved");
            assertThat(parts.camelSafe).isEqualTo("reserved_");
        }

        @Test
        void fromIrJson_withJavaLanguage() {
            ObjectNode root = mapper.createObjectNode();
            ObjectNode casingsConfig = mapper.createObjectNode();
            casingsConfig.put("smartCasing", true);
            casingsConfig.put("generationLanguage", "java");
            root.set("casingsConfig", casingsConfig);

            CasingConfiguration config = CasingConfiguration.fromIrJson(root);
            CasingConfiguration.NameParts parts = config.computeName("userId");

            // Java is not in CAPITALIZE_INITIALISM_LANGUAGES -> no initialism
            assertThat(parts.camelUnsafe).isEqualTo("userId");
            assertThat(parts.pascalUnsafe).isEqualTo("UserId");
        }
    }

    // ===== Cross-check with TypeScript CasingsGenerator behavior =====

    @Nested
    class TypeScriptParityTests {

        @Test
        void parity_normalName_noSmartCasing() {
            // Matches TypeScript test: "normalName" with smartCasing=false
            CasingConfiguration config = buildConfig(false, null, null);
            CasingConfiguration.NameParts parts = config.computeName("normalName");

            assertThat(parts.camelUnsafe).isEqualTo("normalName");
            assertThat(parts.snakeUnsafe).isEqualTo("normal_name");
            assertThat(parts.pascalUnsafe).isEqualTo("NormalName");
        }

        @ParameterizedTest
        @CsvSource({
            "hello,hello,Hello,hello,HELLO",
            "helloWorld,helloWorld,HelloWorld,hello_world,HELLO_WORLD",
            "HelloWorld,helloWorld,HelloWorld,hello_world,HELLO_WORLD",
            "HELLO_WORLD,helloWorld,HelloWorld,hello_world,HELLO_WORLD",
        })
        void parity_backwardCompatibility_noSmartCasing(
                String input, String camel, String pascal, String snake, String screaming) {
            CasingConfiguration config = buildConfig(false, null, null);
            CasingConfiguration.NameParts parts = config.computeName(input);

            assertThat(parts.camelUnsafe).isEqualTo(camel);
            assertThat(parts.pascalUnsafe).isEqualTo(pascal);
            assertThat(parts.snakeUnsafe).isEqualTo(snake);
            assertThat(parts.screamingSnakeUnsafe).isEqualTo(screaming);
        }

        @ParameterizedTest
        @CsvSource({
            "v2,v2,V2",
            "ec2,ec2,EC2",
            "applicationV1,application_v1,APPLICATION_V1",
        })
        void parity_smartCasing_snakeCase(String input, String snake, String screaming) {
            CasingConfiguration config = buildConfig(true, null, null);
            CasingConfiguration.NameParts parts = config.computeName(input);

            assertThat(parts.snakeUnsafe).isEqualTo(snake);
            assertThat(parts.screamingSnakeUnsafe).isEqualTo(screaming);
        }

        @Test
        void parity_smartCasing_go_getHttpResponse() {
            // Matches TypeScript test: "_getHttpResponse" with Go+smartCasing
            // (we omit the underscore since Java CasingConfiguration doesn't do preserveUnderscores)
            CasingConfiguration config = buildConfig(true, "go", null);
            CasingConfiguration.NameParts parts = config.computeName("getHttpResponse");

            assertThat(parts.camelUnsafe).isEqualTo("getHTTPResponse");
        }
    }

    // ===== Helper to construct CasingConfiguration via fromIrJson =====

    private static CasingConfiguration buildConfig(boolean smartCasing, String language, List<String> keywords) {
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode root = mapper.createObjectNode();
        ObjectNode casingsConfig = mapper.createObjectNode();
        casingsConfig.put("smartCasing", smartCasing);
        if (language != null) {
            casingsConfig.put("generationLanguage", language);
        }
        if (keywords != null) {
            var arr = casingsConfig.putArray("keywords");
            for (String kw : keywords) {
                arr.add(kw);
            }
        }
        root.set("casingsConfig", casingsConfig);
        return CasingConfiguration.fromIrJson(root);
    }
}
