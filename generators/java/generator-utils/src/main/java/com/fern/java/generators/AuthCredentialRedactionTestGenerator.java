/*
 * (c) Copyright 2023 Birch Solutions Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.fern.java.generators;

import com.fern.java.AbstractGeneratorContext;
import com.fern.java.output.GeneratedJavaFile;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeSpec;
import javax.lang.model.element.Modifier;

/** Security test to verify toString() methods don't leak credentials in logs and debuggers. */
public final class AuthCredentialRedactionTestGenerator extends AbstractFileGenerator {
    private static final String AUTH_CREDENTIAL_REDACTION_TEST_CLASS_NAME = "AuthCredentialRedactionTest";
    private final boolean hasBearer;
    private final boolean hasBasic;

    public AuthCredentialRedactionTestGenerator(
            AbstractGeneratorContext<?, ?> generatorContext, boolean hasBearer, boolean hasBasic) {
        super(
                ClassName.get(
                        generatorContext.getPoetClassNameFactory().getRootPackage(),
                        AUTH_CREDENTIAL_REDACTION_TEST_CLASS_NAME),
                generatorContext);
        this.hasBearer = hasBearer;
        this.hasBasic = hasBasic;
    }

    @Override
    public GeneratedJavaFile generateFile() {
        ClassName testAnnotation = ClassName.get("org.junit.jupiter.api", "Test");
        ClassName bearerAuthClassName =
                generatorContext.getPoetClassNameFactory().getCoreClassName("BearerAuth");
        ClassName basicAuthClassName =
                generatorContext.getPoetClassNameFactory().getCoreClassName("BasicAuth");

        TypeSpec.Builder testTypeSpecBuilder = TypeSpec.classBuilder(AUTH_CREDENTIAL_REDACTION_TEST_CLASS_NAME)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addJavadoc(
                        "Security test to verify toString() methods don't leak credentials in logs and debuggers.\n");

        // Add Bearer auth tests if present
        if (hasBearer) {
            testTypeSpecBuilder
                    .addMethod(createTestBearerAuthToStringDoesNotExposeToken(testAnnotation, bearerAuthClassName))
                    .addMethod(createTestBearerAuthGetTokenStillWorks(testAnnotation, bearerAuthClassName))
                    .addMethod(createTestToStringInLoggingScenario(testAnnotation, bearerAuthClassName))
                    .addMethod(createTestMultipleBearerAuthInstancesAllRedacted(testAnnotation, bearerAuthClassName));
        }

        // Add Basic auth tests if present
        if (hasBasic) {
            testTypeSpecBuilder
                    .addMethod(createTestBasicAuthToStringDoesNotExposeCredentials(testAnnotation, basicAuthClassName))
                    .addMethod(createTestBasicAuthAccessorsStillWork(testAnnotation, basicAuthClassName))
                    .addMethod(createTestMultipleBasicAuthInstancesAllRedacted(testAnnotation, basicAuthClassName))
                    .addMethod(createTestPasswordWithSpecialCharacters(testAnnotation, basicAuthClassName));
        }

        // Add combined test if both are present
        if (hasBearer && hasBasic) {
            testTypeSpecBuilder.addMethod(
                    createTestToStringInStringConcatenation(testAnnotation, bearerAuthClassName, basicAuthClassName));
        }

        TypeSpec testTypeSpec = testTypeSpecBuilder.build();

        JavaFile testFile = JavaFile.builder(className.packageName(), testTypeSpec)
                .addStaticImport(ClassName.get("org.junit.jupiter.api", "Assertions"), "*")
                .build();

        return GeneratedJavaFile.builder()
                .className(className)
                .javaFile(testFile)
                .testFile(true)
                .build();
    }

    private MethodSpec createTestBearerAuthToStringDoesNotExposeToken(
            ClassName testAnnotation, ClassName bearerAuthClassName) {
        return MethodSpec.methodBuilder("testBearerAuthToStringDoesNotExposeToken")
                .addAnnotation(testAnnotation)
                .addModifiers(Modifier.PUBLIC)
                .addStatement("$T sensitiveToken = $S", String.class, "sk_live_secret_key_12345")
                .addStatement("$T auth = $T.of(sensitiveToken)", bearerAuthClassName, bearerAuthClassName)
                .addCode("\n")
                .addStatement("$T toStringResult = auth.toString()", String.class)
                .addCode("\n")
                .addStatement("assertEquals($S, toStringResult)", bearerAuthClassName.simpleName() + "{token=[REDACTED]}")
                .addStatement("assertFalse(toStringResult.contains(sensitiveToken))")
                .addStatement("assertFalse(toStringResult.contains($S))", "sk_live")
                .addStatement("assertFalse(toStringResult.contains($S))", "secret_key")
                .build();
    }

    private MethodSpec createTestBearerAuthGetTokenStillWorks(ClassName testAnnotation, ClassName bearerAuthClassName) {
        return MethodSpec.methodBuilder("testBearerAuthGetTokenStillWorks")
                .addAnnotation(testAnnotation)
                .addModifiers(Modifier.PUBLIC)
                .addStatement("$T sensitiveToken = $S", String.class, "sk_live_secret_key_12345")
                .addStatement("$T auth = $T.of(sensitiveToken)", bearerAuthClassName, bearerAuthClassName)
                .addCode("\n")
                .addStatement("assertEquals(sensitiveToken, auth.getToken())")
                .build();
    }

    private MethodSpec createTestBasicAuthToStringDoesNotExposeCredentials(
            ClassName testAnnotation, ClassName basicAuthClassName) {
        return MethodSpec.methodBuilder("testBasicAuthToStringDoesNotExposeCredentials")
                .addAnnotation(testAnnotation)
                .addModifiers(Modifier.PUBLIC)
                .addStatement("$T username = $S", String.class, "admin")
                .addStatement("$T password = $S", String.class, "super_secret_password_123")
                .addStatement("$T auth = $T.of(username, password)", basicAuthClassName, basicAuthClassName)
                .addCode("\n")
                .addStatement("$T toStringResult = auth.toString()", String.class)
                .addCode("\n")
                .addStatement("assertEquals($S, toStringResult)", basicAuthClassName.simpleName() + "{credentials=[REDACTED]}")
                .addStatement("assertFalse(toStringResult.contains(username))")
                .addStatement("assertFalse(toStringResult.contains(password))")
                .addStatement("assertFalse(toStringResult.contains($S))", "admin")
                .addStatement("assertFalse(toStringResult.contains($S))", "super_secret")
                .build();
    }

    private MethodSpec createTestBasicAuthAccessorsStillWork(ClassName testAnnotation, ClassName basicAuthClassName) {
        return MethodSpec.methodBuilder("testBasicAuthAccessorsStillWork")
                .addAnnotation(testAnnotation)
                .addModifiers(Modifier.PUBLIC)
                .addStatement("$T username = $S", String.class, "admin")
                .addStatement("$T password = $S", String.class, "super_secret_password_123")
                .addStatement("$T auth = $T.of(username, password)", basicAuthClassName, basicAuthClassName)
                .addCode("\n")
                .addStatement("assertEquals(username, auth.username())")
                .addStatement("assertEquals(password, auth.password())")
                .addCode("\n")
                .addStatement("assertNotNull(auth.getToken())")
                .addStatement("assertFalse(auth.getToken().isEmpty())")
                .build();
    }

    private MethodSpec createTestToStringInStringConcatenation(
            ClassName testAnnotation, ClassName bearerAuthClassName, ClassName basicAuthClassName) {
        return MethodSpec.methodBuilder("testToStringInStringConcatenation")
                .addAnnotation(testAnnotation)
                .addModifiers(Modifier.PUBLIC)
                .addStatement("$T bearerAuth = $T.of($S)", bearerAuthClassName, bearerAuthClassName, "secret_token")
                .addStatement("$T basicAuth = $T.of($S, $S)", basicAuthClassName, basicAuthClassName, "user", "pass")
                .addCode("\n")
                .addStatement("$T bearerConcat = $S + bearerAuth", String.class, "Auth: ")
                .addStatement("$T basicConcat = $S + basicAuth", String.class, "Auth: ")
                .addCode("\n")
                .addStatement("assertTrue(bearerConcat.contains($S))", "[REDACTED]")
                .addStatement("assertTrue(basicConcat.contains($S))", "[REDACTED]")
                .addStatement("assertFalse(bearerConcat.contains($S))", "secret_token")
                .addStatement("assertFalse(basicConcat.contains($S))", "user")
                .addStatement("assertFalse(basicConcat.contains($S))", "pass")
                .build();
    }

    private MethodSpec createTestToStringInLoggingScenario(ClassName testAnnotation, ClassName bearerAuthClassName) {
        return MethodSpec.methodBuilder("testToStringInLoggingScenario")
                .addAnnotation(testAnnotation)
                .addModifiers(Modifier.PUBLIC)
                .addStatement("$T auth = $T.of($S)", bearerAuthClassName, bearerAuthClassName, "secret_api_key")
                .addCode("\n")
                .addStatement("$T logFormat = String.format($S, auth)", String.class, "Request with auth: %s")
                .addStatement("$T logConcat = $S + auth", String.class, "Request with auth: ")
                .addCode("\n")
                .addStatement("assertTrue(logFormat.contains($S))", "[REDACTED]")
                .addStatement("assertTrue(logConcat.contains($S))", "[REDACTED]")
                .addStatement("assertFalse(logFormat.contains($S))", "secret_api_key")
                .addStatement("assertFalse(logConcat.contains($S))", "secret_api_key")
                .build();
    }

    private MethodSpec createTestMultipleBearerAuthInstancesAllRedacted(
            ClassName testAnnotation, ClassName bearerAuthClassName) {
        return MethodSpec.methodBuilder("testMultipleBearerAuthInstancesAllRedacted")
                .addAnnotation(testAnnotation)
                .addModifiers(Modifier.PUBLIC)
                .addStatement("$T auth1 = $T.of($S)", bearerAuthClassName, bearerAuthClassName, "token1")
                .addStatement("$T auth2 = $T.of($S)", bearerAuthClassName, bearerAuthClassName, "token2")
                .addStatement("$T auth3 = $T.of($S)", bearerAuthClassName, bearerAuthClassName, "token3")
                .addCode("\n")
                .addStatement("assertEquals($S, auth1.toString())", bearerAuthClassName.simpleName() + "{token=[REDACTED]}")
                .addStatement("assertEquals($S, auth2.toString())", bearerAuthClassName.simpleName() + "{token=[REDACTED]}")
                .addStatement("assertEquals($S, auth3.toString())", bearerAuthClassName.simpleName() + "{token=[REDACTED]}")
                .addCode("\n")
                .addStatement("assertEquals($S, auth1.getToken())", "token1")
                .addStatement("assertEquals($S, auth2.getToken())", "token2")
                .addStatement("assertEquals($S, auth3.getToken())", "token3")
                .build();
    }

    private MethodSpec createTestMultipleBasicAuthInstancesAllRedacted(
            ClassName testAnnotation, ClassName basicAuthClassName) {
        return MethodSpec.methodBuilder("testMultipleBasicAuthInstancesAllRedacted")
                .addAnnotation(testAnnotation)
                .addModifiers(Modifier.PUBLIC)
                .addStatement("$T auth1 = $T.of($S, $S)", basicAuthClassName, basicAuthClassName, "user1", "pass1")
                .addStatement("$T auth2 = $T.of($S, $S)", basicAuthClassName, basicAuthClassName, "user2", "pass2")
                .addCode("\n")
                .addStatement("assertEquals($S, auth1.toString())", basicAuthClassName.simpleName() + "{credentials=[REDACTED]}")
                .addStatement("assertEquals($S, auth2.toString())", basicAuthClassName.simpleName() + "{credentials=[REDACTED]}")
                .addCode("\n")
                .addStatement("assertEquals($S, auth1.username())", "user1")
                .addStatement("assertEquals($S, auth2.username())", "user2")
                .build();
    }

    private MethodSpec createTestPasswordWithSpecialCharacters(ClassName testAnnotation, ClassName basicAuthClassName) {
        return MethodSpec.methodBuilder("testPasswordWithSpecialCharacters")
                .addAnnotation(testAnnotation)
                .addModifiers(Modifier.PUBLIC)
                .addStatement("$T password = $S", String.class, "p@$$w0rd!#$%^&*()")
                .addStatement("$T auth = $T.of($S, password)", basicAuthClassName, basicAuthClassName, "user")
                .addCode("\n")
                .addStatement("$T toStringResult = auth.toString()", String.class)
                .addStatement("assertEquals($S, toStringResult)", basicAuthClassName.simpleName() + "{credentials=[REDACTED]}")
                .addStatement("assertFalse(toStringResult.contains(password))")
                .addStatement("assertFalse(toStringResult.contains($S))", "@$$w0rd")
                .addCode("\n")
                .addStatement("assertEquals(password, auth.password())")
                .build();
    }
}
