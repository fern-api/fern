package com.fern.java.generators.object;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module;
import com.fern.ir.model.commons.Name;
import com.fern.ir.model.commons.NameAndWireValue;
import com.fern.ir.model.commons.NameAndWireValueOrString;
import com.fern.ir.model.commons.NameOrString;
import com.fern.ir.model.commons.SafeAndUnsafeString;
import com.fern.ir.model.types.ContainerType;
import com.fern.ir.model.types.ObjectProperty;
import com.fern.ir.model.types.PrimitiveType;
import com.fern.ir.model.types.PrimitiveTypeV1;
import com.fern.ir.model.types.TypeReference;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.ICustomConfig;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import javax.tools.JavaCompiler;
import javax.tools.ToolProvider;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * Compiles generated objects and checks that unknown JSON keys which only differ in case from a declared property are
 * not kept as additional properties (and so are not re-emitted), while other unknown keys still round-trip.
 */
class AdditionalPropertiesCaseCollisionTest {

    private static final String PACKAGE = "com.seed.object";
    private static final ObjectMapper MAPPER = new ObjectMapper().registerModule(new Jdk8Module());

    private static Class<?> amountClass;
    private static Class<?> payeeClass;

    @BeforeAll
    static void compileGeneratedObjects(@TempDir Path tempDir) throws Exception {
        ClassName objectMappers = ClassName.get(PACKAGE + ".core", "ObjectMappers");
        ClassName nullable = ClassName.get(PACKAGE + ".core", "Nullable");
        // Staged builder: all properties required.
        String amount = generate(
                ClassName.get(PACKAGE, "Amount"),
                objectMappers,
                nullable,
                List.of(property("value", TypeName.INT, false), property("kind", ClassName.get(String.class), false)));
        // Default builder: all properties optional.
        String payee = generate(
                ClassName.get(PACKAGE, "Payee"),
                objectMappers,
                nullable,
                List.of(property(
                        "name",
                        ParameterizedTypeName.get(ClassName.get(Optional.class), ClassName.get(String.class)),
                        true)));

        Path sourceDir = tempDir.resolve("src");
        Path classesDir = Files.createDirectories(tempDir.resolve("classes"));
        Path packageDir = Files.createDirectories(sourceDir.resolve(PACKAGE.replace('.', '/')));
        Path coreDir = Files.createDirectories(packageDir.resolve("core"));
        List<String> args = new ArrayList<>(
                List.of("-classpath", System.getProperty("java.class.path"), "-d", classesDir.toString()));
        args.add(write(packageDir, "Amount.java", amount));
        args.add(write(packageDir, "Payee.java", payee));
        args.add(write(
                coreDir,
                "ObjectMappers.java",
                "package " + PACKAGE + ".core;\n"
                        + "public final class ObjectMappers {\n"
                        + "    public static String stringify(Object o) { return String.valueOf(o.hashCode()); }\n"
                        + "}\n"));

        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        int exitCode = compiler.run(null, null, null, args.toArray(new String[0]));
        assertThat(exitCode).as("generated sources compile").isZero();
        URLClassLoader classLoader = new URLClassLoader(
                new URL[] {classesDir.toUri().toURL()}, AdditionalPropertiesCaseCollisionTest.class.getClassLoader());
        amountClass = classLoader.loadClass(PACKAGE + ".Amount");
        payeeClass = classLoader.loadClass(PACKAGE + ".Payee");
    }

    @Test
    void stagedBuilder_dropsCaseCollidingKeys_keepsOtherUnknownKeys() throws Exception {
        JsonNode out = roundTrip(
                amountClass,
                "{\"value\":1,\"VALUE\":99999,\"kind\":\"gbp\",\"Kind\":\"usd\",\"brand_new_field\":\"kept\"}");
        assertThat(out.toString()).isEqualTo("{\"value\":1,\"kind\":\"gbp\",\"brand_new_field\":\"kept\"}");
    }

    @Test
    void defaultBuilder_dropsCaseCollidingKeys_keepsOtherUnknownKeys() throws Exception {
        JsonNode out = roundTrip(
                payeeClass, "{\"name\":\"Legit Payee\",\"NAME\":\"Attacker Ltd\",\"nAmE\":\"x\",\"extra\":{\"a\":1}}");
        assertThat(out.toString()).isEqualTo("{\"name\":\"Legit Payee\",\"extra\":{\"a\":1}}");
    }

    @Test
    void dropsCollidingKeyEvenWhenDeclaredFieldIsAbsent() throws Exception {
        JsonNode out = roundTrip(payeeClass, "{\"NAME\":\"Attacker Ltd\"}");
        assertThat(out.toString()).isEqualTo("{}");
    }

    @Test
    void dropsUnicodeCaseFoldingCollisions() throws Exception {
        // U+212A KELVIN SIGN folds to 'k' in case-insensitive decoders such as Go's encoding/json.
        JsonNode out = roundTrip(amountClass, "{\"value\":1,\"kind\":\"gbp\",\"\\u212Aind\":\"usd\"}");
        assertThat(out.toString()).isEqualTo("{\"value\":1,\"kind\":\"gbp\"}");
    }

    private static JsonNode roundTrip(Class<?> type, String json) throws Exception {
        Object decoded = MAPPER.readValue(json, type);
        return MAPPER.readTree(MAPPER.writeValueAsString(decoded));
    }

    private static String generate(
            ClassName className, ClassName objectMappers, ClassName nullable, List<EnrichedObjectProperty> properties) {
        ObjectTypeSpecGenerator generator = new ObjectTypeSpecGenerator(
                className,
                objectMappers,
                nullable,
                properties,
                List.of(),
                true,
                false,
                true,
                ICustomConfig.JsonInclude.NON_ABSENT,
                false,
                false,
                Optional.empty());
        return JavaFile.builder(className.packageName(), generator.generate())
                .build()
                .toString();
    }

    private static EnrichedObjectProperty property(String wireValue, TypeName poetTypeName, boolean optional) {
        TypeReference primitive = TypeReference.primitive(PrimitiveType.builder()
                .v1(poetTypeName.equals(TypeName.INT) ? PrimitiveTypeV1.INTEGER : PrimitiveTypeV1.STRING)
                .build());
        ObjectProperty objectProperty = ObjectProperty.builder()
                .name(NameAndWireValueOrString.of(NameAndWireValue.builder()
                        .wireValue(wireValue)
                        .name(NameOrString.of(name(wireValue)))
                        .build()))
                .valueType(optional ? TypeReference.container(ContainerType.optional(primitive)) : primitive)
                .build();
        return EnrichedObjectProperty.of(
                objectProperty,
                AbstractGeneratorContext.GeneratorType.SDK,
                Optional.empty(),
                ClassName.get(PACKAGE + ".core", "NullableNonemptyFilter"),
                false,
                false,
                false,
                poetTypeName,
                false,
                false);
    }

    private static Name name(String value) {
        SafeAndUnsafeString casing =
                SafeAndUnsafeString.builder().unsafeName(value).safeName(value).build();
        return Name.builder()
                .originalName(value)
                .camelCase(casing)
                .pascalCase(SafeAndUnsafeString.builder()
                        .unsafeName(Character.toUpperCase(value.charAt(0)) + value.substring(1))
                        .safeName(Character.toUpperCase(value.charAt(0)) + value.substring(1))
                        .build())
                .snakeCase(casing)
                .screamingSnakeCase(casing)
                .build();
    }

    private static String write(Path dir, String fileName, String source) throws Exception {
        Path path = dir.resolve(fileName);
        Files.writeString(path, source);
        return path.toString();
    }
}
