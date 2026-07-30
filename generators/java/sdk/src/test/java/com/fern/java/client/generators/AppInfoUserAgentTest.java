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

package com.fern.java.client.generators;

import static org.assertj.core.api.Assertions.assertThat;

import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeSpec;
import java.lang.reflect.Method;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import javax.lang.model.element.Modifier;
import javax.tools.JavaCompiler;
import javax.tools.ToolProvider;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * Compiles the exact {@code appInfo} User-Agent helpers that {@link ClientOptionsGenerator} emits into the generated
 * {@code ClientOptions} class (when {@code allowUserAgentAppInfo} is enabled) and exercises them via reflection, so the
 * assertions run against the code SDK consumers actually receive rather than a hand-written copy.
 */
class AppInfoUserAgentTest {

    private static final String PACKAGE = "com.fern.test.appinfo";
    private static final String CLASS_NAME = "AppInfoHelpers";
    private static final String BASE = "com.acme.sdk/1.4.0";

    private static Class<?> helpersClass;

    @BeforeAll
    static void compileEmittedHelpers(@TempDir Path tempDir) throws Exception {
        // Assemble the emitted helper MethodSpecs into a real class and compile it, exactly as they are emitted into
        // ClientOptions.
        TypeSpec type = TypeSpec.classBuilder(CLASS_NAME)
                .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                .addMethod(ClientOptionsGenerator.buildAppendAppInfoMethod())
                .addMethod(ClientOptionsGenerator.buildAppInfoProductTokenMethod())
                .addMethod(ClientOptionsGenerator.buildEncodeTokenMethod())
                .addMethod(ClientOptionsGenerator.buildEncodeCommentMethod())
                .addMethod(ClientOptionsGenerator.buildAppendPercentEncodedMethod())
                // Public wrapper so the package-private static helpers can be invoked via reflection.
                .addMethod(MethodSpec.methodBuilder("apply")
                        .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                        .returns(String.class)
                        .addParameter(String.class, "userAgent")
                        .addParameter(String.class, "name")
                        .addParameter(String.class, "version")
                        .addParameter(String.class, "comment")
                        .addStatement("return appendAppInfo(userAgent, appInfoProductToken(name, version, comment))")
                        .build())
                .build();

        Path sourceDir = tempDir.resolve("src");
        Path classesDir = tempDir.resolve("classes");
        Files.createDirectories(classesDir);
        JavaFile.builder(PACKAGE, type).build().writeTo(sourceDir);

        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        if (compiler == null) {
            throw new IllegalStateException("A JDK (not JRE) is required to run AppInfoUserAgentTest");
        }
        Path sourceFile = sourceDir.resolve(PACKAGE.replace('.', '/')).resolve(CLASS_NAME + ".java");
        java.io.ByteArrayOutputStream diagnostics = new java.io.ByteArrayOutputStream();
        int exitCode = compiler.run(
                null,
                null,
                diagnostics,
                "-d",
                classesDir.toAbsolutePath().toString(),
                sourceFile.toAbsolutePath().toString());
        if (exitCode != 0) {
            throw new IllegalStateException("Failed to compile emitted appInfo helpers:\n"
                    + diagnostics.toString(StandardCharsets.UTF_8) + "\n\nSOURCE:\n"
                    + Files.readString(sourceFile));
        }
        URLClassLoader classLoader =
                new URLClassLoader(new URL[] {classesDir.toUri().toURL()});
        helpersClass = classLoader.loadClass(PACKAGE + "." + CLASS_NAME);
    }

    private static String apply(String name, String version, String comment) throws Exception {
        Method method = helpersClass.getMethod("apply", String.class, String.class, String.class, String.class);
        return (String) method.invoke(null, BASE, name, version, comment);
    }

    @Test
    void returnsUserAgentUnchangedWhenNameIsNull() throws Exception {
        assertThat(apply(null, null, null)).isEqualTo(BASE);
    }

    @Test
    void returnsUserAgentUnchangedWhenNameIsEmpty() throws Exception {
        assertThat(apply("", null, null)).isEqualTo(BASE);
    }

    @Test
    void returnsUserAgentUnchangedWhenNameIsWhitespaceOnly() throws Exception {
        assertThat(apply("   ", null, null)).isEqualTo(BASE);
        assertThat(apply("\t\n ", null, null)).isEqualTo(BASE);
    }

    @Test
    void appendsNameOnlyWhenVersionAndCommentAbsent() throws Exception {
        assertThat(apply("partner-app", null, null)).isEqualTo(BASE + " partner-app");
    }

    @Test
    void appendsNameAndVersion() throws Exception {
        assertThat(apply("partner-app", "3.1.0", null)).isEqualTo(BASE + " partner-app/3.1.0");
    }

    @Test
    void appendsNameVersionComment() throws Exception {
        assertThat(apply("partner-app", "3.1.0", "+https://partner.example"))
                .isEqualTo(BASE + " partner-app/3.1.0 (+https://partner.example)");
    }

    @Test
    void omitsVersionSegmentWhenVersionBlank() throws Exception {
        assertThat(apply("partner-app", "", null)).isEqualTo(BASE + " partner-app");
        assertThat(apply("partner-app", "   ", null)).isEqualTo(BASE + " partner-app");
    }

    @Test
    void omitsCommentGroupWhenCommentBlank() throws Exception {
        assertThat(apply("partner-app", null, "   ")).isEqualTo(BASE + " partner-app");
    }

    @Test
    void trimsSurroundingWhitespaceRatherThanEncodingIt() throws Exception {
        // Guards against the known bug where whitespace-only / padded values were encoded into junk tokens.
        assertThat(apply(" partner-app ", " 3.1.0 ", " a comment ")).isEqualTo(BASE + " partner-app/3.1.0 (a comment)");
    }

    @Test
    void tokenEncodesSpacesInName() throws Exception {
        String result = apply("evil app", null, null);
        assertThat(result).isEqualTo(BASE + " evil%20app");
        assertThat(result).doesNotContain("evil app");
    }

    @Test
    void preventsCrlfInjectionViaName() throws Exception {
        String result = apply("x\r\nX-Injected: 1", null, null);
        assertThat(result).doesNotContain("\r").doesNotContain("\n").contains("%0D%0A");
    }

    @Test
    void preventsCrlfInjectionViaVersion() throws Exception {
        String result = apply("app", "1.0\r\nEvil: 1", null);
        assertThat(result).doesNotContain("\r").doesNotContain("\n").contains("%0D%0A");
    }

    @Test
    void preventsCrlfInjectionViaComment() throws Exception {
        String result = apply("app", null, "ok\r\nEvil: 1");
        assertThat(result).doesNotContain("\r").doesNotContain("\n").contains("%0D%0A");
    }

    @Test
    void escapesParenthesesAndBackslashInComment() throws Exception {
        String result = apply("app", null, "a)b(c\\d");
        assertThat(result).isEqualTo(BASE + " app (a%29b%28c%5Cd)");
    }

    @Test
    void keepsPrintableCommentCharactersReadable() throws Exception {
        assertThat(apply("app", null, "+https://partner.example/path?q=1"))
                .isEqualTo(BASE + " app (+https://partner.example/path?q=1)");
    }
}
