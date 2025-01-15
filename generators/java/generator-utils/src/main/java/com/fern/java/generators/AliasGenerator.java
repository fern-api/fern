package com.fern.java.generators;

import com.fasterxml.jackson.annotation.JsonValue;
import com.fern.ir.model.commons.TypeId;
import com.fern.ir.model.types.AliasTypeDeclaration;
import com.fern.ir.model.types.DeclaredTypeName;
import com.fern.ir.model.types.PrimitiveType;
import com.fern.ir.model.types.PrimitiveTypeV1;
import com.fern.ir.model.types.TypeDeclaration;
import com.fern.ir.model.types.TypeReference;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.FernJavaAnnotations;
import com.fern.java.PoetTypeNameMapper;
import com.fern.java.utils.NamedTypeId;
import com.fern.java.utils.NamedTypeIdResolver;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import java.awt.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import javax.lang.model.element.Modifier;

public final class AliasGenerator extends AbstractTypeGenerator {

    private static final String VALUE_FIELD_NAME = "value";
    private static final String VALUE_FIELD_NAME_PASCAL = "Value";
    private static final String OF_METHOD_NAME = "of";
    private final AliasTypeDeclaration aliasTypeDeclaration;

    public AliasGenerator(
            ClassName className,
            AbstractGeneratorContext<?, ?> generatorContext,
            AliasTypeDeclaration aliasTypeDeclaration,
            Set<String> reservedTypeNames,
            boolean isTopLevelClass) {
        super(className, generatorContext, reservedTypeNames, isTopLevelClass);
        this.aliasTypeDeclaration = aliasTypeDeclaration;
    }

    @Override
    public List<TypeDeclaration> getInlineTypeDeclarations() {
        return new ArrayList<>(overriddenTypeDeclarations(generatorContext, aliasTypeDeclaration)
                .values());
    }

    private static Map<TypeId, TypeDeclaration> overriddenTypeDeclarations(
            AbstractGeneratorContext<?, ?> generatorContext, AliasTypeDeclaration aliasTypeDeclaration) {
        Map<TypeId, TypeDeclaration> overriddenTypeDeclarations = new HashMap<>();

        List<NamedTypeId> resolvedIds = aliasTypeDeclaration
                .getAliasOf()
                .visit(new NamedTypeIdResolver(VALUE_FIELD_NAME_PASCAL, aliasTypeDeclaration.getAliasOf()));
        for (NamedTypeId resolvedId : resolvedIds) {
            String name = resolvedId.name();
            Optional<TypeDeclaration> maybeRawTypeDeclaration =
                    Optional.ofNullable(generatorContext.getTypeDeclarations().get(resolvedId.typeId()));

            if (maybeRawTypeDeclaration.isEmpty()) {
                continue;
            }

            TypeDeclaration rawTypeDeclaration = maybeRawTypeDeclaration.get();

            // Don't override non-inline types
            if (!rawTypeDeclaration.getInline().orElse(false)) {
                continue;
            }

            TypeDeclaration overriddenTypeDeclaration = overrideTypeDeclarationName(rawTypeDeclaration, name);
            overriddenTypeDeclarations.put(resolvedId.typeId(), overriddenTypeDeclaration);
        }

        return overriddenTypeDeclarations;
    }

    private PoetTypeNameMapper overriddenPoetTypeNameMapper(Map<TypeId, TypeDeclaration> overriddenTypeDeclarations) {
        Map<DeclaredTypeName, ClassName> enclosingMapping = new HashMap<>();
        for (TypeDeclaration override : overriddenTypeDeclarations.values()) {
            enclosingMapping.put(override.getName(), className);
        }

        Map<TypeId, TypeDeclaration> typeDeclarationsWithOverrides =
                new HashMap<>(generatorContext.getTypeDeclarations());
        typeDeclarationsWithOverrides.putAll(overriddenTypeDeclarations);

        return new PoetTypeNameMapper(
                generatorContext.getPoetClassNameFactory(),
                generatorContext.getCustomConfig(),
                typeDeclarationsWithOverrides,
                enclosingMapping);
    }

    @Override
    protected TypeSpec getTypeSpecWithoutInlineTypes() {
        TypeSpec.Builder aliasTypeSpecBuilder =
                TypeSpec.classBuilder(className).addModifiers(Modifier.PUBLIC, Modifier.FINAL);
        PoetTypeNameMapper poetTypeNameMapper;
        if (generatorContext.getCustomConfig().enableInlineTypes()) {
            poetTypeNameMapper =
                    overriddenPoetTypeNameMapper(overriddenTypeDeclarations(generatorContext, aliasTypeDeclaration));
        } else {
            poetTypeNameMapper = generatorContext.getPoetTypeNameMapper();
        }
        TypeName aliasTypeName = poetTypeNameMapper.convertToTypeName(true, aliasTypeDeclaration.getAliasOf());
        TypeSpec.Builder aliasBuilder = aliasTypeSpecBuilder
                .addField(aliasTypeName, VALUE_FIELD_NAME, Modifier.PRIVATE, Modifier.FINAL)
                .addMethod(getConstructor(aliasTypeName))
                .addMethod(getGetMethod(aliasTypeName))
                .addMethod(getEqualsMethod(aliasTypeName))
                .addMethod(getHashCodeMethod())
                .addMethod(getToStringMethod())
                .addMethod(getOfMethodName(aliasTypeName));
        Optional<CodeBlock> maybeValueOfFactoryMethod = valueOfFactoryMethod(aliasTypeDeclaration.getAliasOf());
        if (maybeValueOfFactoryMethod.isPresent()) {
            aliasBuilder.addMethod(MethodSpec.methodBuilder("valueOf")
                    .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                    .addParameter(ParameterSpec.builder(String.class, VALUE_FIELD_NAME)
                            .build())
                    .returns(className)
                    .addCode(maybeValueOfFactoryMethod.get())
                    .build());
        }
        return aliasTypeSpecBuilder.build();
    }

    private MethodSpec getConstructor(TypeName aliasTypeName) {
        return MethodSpec.constructorBuilder()
                .addModifiers(
                        this.generatorContext.getCustomConfig().enablePublicConstructors()
                                ? Modifier.PUBLIC
                                : Modifier.PRIVATE)
                .addParameter(aliasTypeName, VALUE_FIELD_NAME)
                .addStatement("this.value = value")
                .build();
    }

    private MethodSpec getOfMethodName(TypeName aliasTypeName) {
        return MethodSpec.methodBuilder(OF_METHOD_NAME)
                .addAnnotation(FernJavaAnnotations.jacksonDelegatingCreator())
                .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                .addParameter(aliasTypeName, "value")
                .addStatement("return new $T($L)", className, "value")
                .returns(className)
                .build();
    }

    private MethodSpec getGetMethod(TypeName aliasTypeName) {
        return MethodSpec.methodBuilder("get")
                .addModifiers(Modifier.PUBLIC)
                .addAnnotation(JsonValue.class)
                .returns(aliasTypeName)
                .addStatement("return this.$L", VALUE_FIELD_NAME)
                .build();
    }

    private MethodSpec getEqualsMethod(TypeName aliasTypeName) {
        boolean isPrimitive = aliasTypeName.isPrimitive();
        String impl = isPrimitive
                ? "return this == other || (other instanceof $T && this.$L == (($T) other).value)"
                : "return this == other || (other instanceof $T && this.$L.equals((($T) other).value))";
        return MethodSpec.methodBuilder("equals")
                .addAnnotation(ClassName.get("", "java.lang.Override"))
                .addModifiers(Modifier.PUBLIC)
                .returns(boolean.class)
                .addParameter(Object.class, "other")
                .addStatement(impl, className, VALUE_FIELD_NAME, className)
                .build();
    }

    private MethodSpec getHashCodeMethod() {
        CodeBlock hashCodeMethodBlock;
        if (aliasTypeDeclaration.getAliasOf().isPrimitive()) {
            hashCodeMethodBlock = aliasTypeDeclaration
                    .getAliasOf()
                    .getPrimitive()
                    .get()
                    .getV1()
                    .visit(HashcodeMethodSpecVisitor.INSTANCE);
        } else {
            hashCodeMethodBlock = CodeBlock.of("return $L.$L()", VALUE_FIELD_NAME, "hashCode");
        }
        return MethodSpec.methodBuilder("hashCode")
                .addAnnotation(ClassName.get("", "java.lang.Override"))
                .addModifiers(Modifier.PUBLIC)
                .returns(int.class)
                .addStatement(hashCodeMethodBlock)
                .build();
    }

    private MethodSpec getToStringMethod() {
        CodeBlock toStringMethodCodeBlock;
        if (aliasTypeDeclaration.getAliasOf().isPrimitive()) {
            toStringMethodCodeBlock = aliasTypeDeclaration
                    .getAliasOf()
                    .getPrimitive()
                    .get()
                    .getV1()
                    .visit(ToStringMethodSpecVisitor.INSTANCE);
        } else {
            toStringMethodCodeBlock = CodeBlock.of("return $L.$L()", VALUE_FIELD_NAME, "toString");
        }
        return MethodSpec.methodBuilder("toString")
                .addModifiers(Modifier.PUBLIC)
                .addAnnotation(ClassName.get("", "java.lang.Override"))
                .addStatement(toStringMethodCodeBlock)
                .returns(String.class)
                .build();
    }

    private static Optional<CodeBlock> valueOfFactoryMethod(TypeReference typeReference) {
        if (typeReference.isPrimitive()) {
            return Optional.of(valueOfFactoryMethodForPrimitive(
                    typeReference.getPrimitive().get()));
        }
        // TODO(dsinghvi): handle case of aliased alias
        return Optional.empty();
    }

    @SuppressWarnings("checkstyle:cyclomaticcomplexity")
    private static CodeBlock valueOfFactoryMethodForPrimitive(PrimitiveType primitiveType) {
        switch (primitiveType.getV1().getEnumValue()) {
            case STRING:
            case UUID:
            case DATE_TIME:
                return CodeBlock.builder().addStatement("return of(value)").build();
            case DOUBLE:
                return CodeBlock.builder()
                        .addStatement("return of($T.parseDouble(value))", Double.class)
                        .build();
            case INTEGER:
                return CodeBlock.builder()
                        .addStatement("return of($T.parseInt(value))", Integer.class)
                        .build();
            case BOOLEAN:
                return CodeBlock.builder()
                        .addStatement("return of($T.parseBoolean(value))", Boolean.class)
                        .build();
            case LONG:
                return CodeBlock.builder()
                        .addStatement("return of($T.parseLong(value))", Long.class)
                        .build();
        }
        throw new IllegalStateException("Unsupported primitive type: " + primitiveType + "for `valueOf` method.");
    }

    private static final class ToStringMethodSpecVisitor implements PrimitiveTypeV1.Visitor<CodeBlock> {

        private static final ToStringMethodSpecVisitor INSTANCE = new ToStringMethodSpecVisitor();

        @Override
        public CodeBlock visitInteger() {
            return CodeBlock.of("return $T.$L($L)", Integer.class, "toString", VALUE_FIELD_NAME);
        }

        @Override
        public CodeBlock visitDouble() {
            return CodeBlock.of("return $T.$L($L)", Double.class, "toString", VALUE_FIELD_NAME);
        }

        @Override
        public CodeBlock visitString() {
            return CodeBlock.of("return $L", VALUE_FIELD_NAME);
        }

        @Override
        public CodeBlock visitBoolean() {
            return CodeBlock.of("return $T.$L($L)", Boolean.class, "toString", VALUE_FIELD_NAME);
        }

        @Override
        public CodeBlock visitLong() {
            return CodeBlock.of("return $T.$L($L)", Long.class, "toString", VALUE_FIELD_NAME);
        }

        @Override
        public CodeBlock visitUint() {
            return CodeBlock.of("return $T.$L($L)", Long.class, "toString", VALUE_FIELD_NAME);
        }

        @Override
        public CodeBlock visitUint64() {
            return CodeBlock.of("return $T.$L($L)", Long.class, "toString", VALUE_FIELD_NAME);
        }

        @Override
        public CodeBlock visitFloat() {
            return CodeBlock.of("return $T.$L($L)", Float.class, "toString", VALUE_FIELD_NAME);
        }

        @Override
        public CodeBlock visitDateTime() {
            return CodeBlock.of("return $L.$L()", VALUE_FIELD_NAME, "toString");
        }

        @Override
        public CodeBlock visitDate() {
            return CodeBlock.of("return $L", VALUE_FIELD_NAME);
        }

        @Override
        public CodeBlock visitUuid() {
            return CodeBlock.of("return $L.$L()", VALUE_FIELD_NAME, "toString");
        }

        @Override
        public CodeBlock visitBase64() {
            return CodeBlock.of("return $L", VALUE_FIELD_NAME);
        }

        @Override
        public CodeBlock visitBigInteger() {
            return CodeBlock.of("return $L.$L()", VALUE_FIELD_NAME, "toString");
        }

        @Override
        public CodeBlock visitUnknown(String unknown) {
            throw new RuntimeException("Encountered unknown primitive type: " + unknown);
        }
    }

    private static final class HashcodeMethodSpecVisitor implements PrimitiveTypeV1.Visitor<CodeBlock> {

        private static final HashcodeMethodSpecVisitor INSTANCE = new HashcodeMethodSpecVisitor();

        @Override
        public CodeBlock visitInteger() {
            return CodeBlock.of("return $T.hashCode($L)", Integer.class, VALUE_FIELD_NAME);
        }

        @Override
        public CodeBlock visitDouble() {
            return CodeBlock.of("return $T.hashCode($L)", Double.class, VALUE_FIELD_NAME);
        }

        @Override
        public CodeBlock visitString() {
            return CodeBlock.of("return $L.hashCode()", VALUE_FIELD_NAME);
        }

        @Override
        public CodeBlock visitBoolean() {
            return CodeBlock.of("return $T.hashCode($L)", Boolean.class, VALUE_FIELD_NAME);
        }

        @Override
        public CodeBlock visitLong() {
            return CodeBlock.of("return $L.hashCode()", VALUE_FIELD_NAME);
        }

        @Override
        public CodeBlock visitUint() {
            return CodeBlock.of("return $L.hashCode()", VALUE_FIELD_NAME);
        }

        @Override
        public CodeBlock visitUint64() {
            return CodeBlock.of("return $L.hashCode()", VALUE_FIELD_NAME);
        }

        @Override
        public CodeBlock visitFloat() {
            return CodeBlock.of("return $T.hashCode($L)", Float.class, VALUE_FIELD_NAME);
        }

        @Override
        public CodeBlock visitDateTime() {
            return CodeBlock.of("return $L.hashCode()", VALUE_FIELD_NAME);
        }

        @Override
        public CodeBlock visitDate() {
            return visitString();
        }

        @Override
        public CodeBlock visitUuid() {
            return CodeBlock.of("return $L.hashCode()", VALUE_FIELD_NAME);
        }

        @Override
        public CodeBlock visitBase64() {
            return visitString();
        }

        @Override
        public CodeBlock visitBigInteger() {
            return CodeBlock.of("return $L.hashCode()", VALUE_FIELD_NAME);
        }

        @Override
        public CodeBlock visitUnknown(String unknown) {
            throw new RuntimeException("Encountered unknown primitive type: " + unknown);
        }
    }
}
