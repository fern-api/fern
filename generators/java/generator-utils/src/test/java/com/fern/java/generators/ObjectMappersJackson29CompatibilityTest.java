package com.fern.java.generators;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;

import com.fern.ir.model.types.DeclaredTypeName;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.AbstractPoetClassNameFactory;
import com.fern.java.ICustomConfig;
import com.fern.java.output.GeneratedFile;
import com.squareup.javapoet.ClassName;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import javax.tools.JavaCompiler;
import javax.tools.ToolProvider;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * Generated SDKs declare a recent Jackson version but are documented to run on a Jackson 2.9.x classpath. This test
 * compiles the generated {@code core/ObjectMappers} and the modules it registers against Jackson 2.9.10 (resolved by
 * the {@code test} task in build.gradle), so a generator change cannot reintroduce a Jackson 2.10+ API such as
 * {@code JsonMapper.builder()}.
 */
public final class ObjectMappersJackson29CompatibilityTest {

    private static final String JACKSON_29_CLASSPATH_PROPERTY = "fern.test.jackson29.classpath";

    @TempDir
    Path tempDir;

    @Test
    void generatedObjectMappersCompileAgainstJackson29() throws IOException {
        String jackson29Classpath = System.getProperty(JACKSON_29_CLASSPATH_PROPERTY);
        assertThat(jackson29Classpath)
                .as("%s must be set by the generator-utils test task", JACKSON_29_CLASSPATH_PROPERTY)
                .isNotBlank();
        assertThat(jackson29Classpath).contains("jackson-databind-2.9.10");

        AbstractGeneratorContext<?, ?> context = mock(AbstractGeneratorContext.class);
        doReturn(new TestPoetClassNameFactory()).when(context).getPoetClassNameFactory();

        Path sourceDir = tempDir.resolve("src");
        Path classesDir = tempDir.resolve("classes");
        Files.createDirectories(classesDir);
        List<GeneratedFile> generatedFiles = List.of(
                new ObjectMappersGenerator(context).generateFile(),
                new DateTimeDeserializerGenerator(context).generateFile(),
                new DoubleSerializerGenerator(context).generateFile());
        for (GeneratedFile generatedFile : generatedFiles) {
            generatedFile.write(sourceDir, false, Optional.empty(), ICustomConfig.OutputDirectory.SOURCE_ROOT);
        }
        List<String> sourceFiles;
        try (Stream<Path> paths = Files.walk(sourceDir)) {
            sourceFiles = paths.filter(path -> path.toString().endsWith(".java"))
                    .map(path -> path.toAbsolutePath().toString())
                    .collect(Collectors.toList());
        }
        assertThat(sourceFiles).hasSize(3);

        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        assertThat(compiler).as("a JDK (not a JRE) is required").isNotNull();
        ByteArrayOutputStream diagnostics = new ByteArrayOutputStream();
        List<String> args = Stream.concat(
                        Stream.of(
                                "-classpath",
                                jackson29Classpath,
                                "-d",
                                classesDir.toAbsolutePath().toString()),
                        sourceFiles.stream())
                .collect(Collectors.toList());
        int exitCode = compiler.run(null, null, diagnostics, args.toArray(new String[0]));

        assertThat(exitCode)
                .as(
                        "generated core classes must compile against Jackson 2.9.10:\n%s",
                        diagnostics.toString(StandardCharsets.UTF_8))
                .isZero();
    }

    private static final class TestPoetClassNameFactory extends AbstractPoetClassNameFactory {

        TestPoetClassNameFactory() {
            super(List.of("com", "example", "sdk"), ICustomConfig.PackageLayout.NESTED);
        }

        @Override
        public ClassName getTypeClassName(DeclaredTypeName declaredTypeName) {
            throw new UnsupportedOperationException();
        }

        @Override
        public ClassName getInterfaceClassName(DeclaredTypeName declaredTypeName) {
            throw new UnsupportedOperationException();
        }
    }
}
