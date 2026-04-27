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

package com.fern.java.generators.tests;

import com.fern.ir.model.commons.TypeId;
import com.fern.ir.model.types.ContainerType;
import com.fern.ir.model.types.DeclaredTypeName;
import com.fern.ir.model.types.ObjectProperty;
import com.fern.ir.model.types.ObjectTypeDeclaration;
import com.fern.ir.model.types.PrimitiveTypeV1;
import com.fern.ir.model.types.TypeDeclaration;
import com.fern.ir.model.types.UndiscriminatedUnionMember;
import com.fern.ir.model.types.UndiscriminatedUnionTypeDeclaration;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.utils.NameUtils;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeSpec;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import javax.lang.model.element.Modifier;

public final class UndiscriminatedUnionDeserializationTestGenerator extends AbstractFileGenerator {

    private static final String TEST_CLASS_NAME = "UndiscriminatedUnionTest";

    public UndiscriminatedUnionDeserializationTestGenerator(AbstractGeneratorContext<?, ?> generatorContext) {
        super(
                ClassName.get(generatorContext.getPoetClassNameFactory().getRootPackage(), TEST_CLASS_NAME),
                generatorContext);
    }

    @Override
    public GeneratedJavaFile generateFile() {
        ClassName testAnnotation = ClassName.get("org.junit.jupiter.api", "Test");
        ClassName objectMappersClassName =
                generatorContext.getPoetClassNameFactory().getObjectMapperClassName();

        List<MethodSpec> testMethods = new ArrayList<>();

        for (Map.Entry<TypeId, TypeDeclaration> entry :
                generatorContext.getTypeDeclarations().entrySet()) {
            TypeDeclaration typeDeclaration = entry.getValue();
            if (!typeDeclaration.getShape().isUndiscriminatedUnion()) {
                continue;
            }
            UndiscriminatedUnionTypeDeclaration union =
                    typeDeclaration.getShape().getUndiscriminatedUnion().get();
            ClassName unionClassName =
                    generatorContext.getPoetClassNameFactory().getTypeClassName(typeDeclaration.getName());

            List<TestableVariant> testableVariants = getTestableVariants(union);
            if (testableVariants.size() < 2) {
                continue;
            }

            for (TestableVariant variant : testableVariants) {
                Optional<MethodSpec> method = buildTestMethod(
                        testAnnotation, objectMappersClassName, unionClassName, variant, testableVariants);
                method.ifPresent(testMethods::add);
            }
        }

        TypeSpec.Builder testClassBuilder =
                TypeSpec.classBuilder(TEST_CLASS_NAME).addModifiers(Modifier.PUBLIC, Modifier.FINAL);

        for (MethodSpec method : testMethods) {
            testClassBuilder.addMethod(method);
        }

        TypeSpec testTypeSpec = testClassBuilder.build();
        JavaFile testFile = JavaFile.builder(className.packageName(), testTypeSpec)
                .addStaticImport(ClassName.get("org.junit.jupiter.api", "Assertions"), "*")
                .build();

        return GeneratedJavaFile.builder()
                .className(className)
                .javaFile(testFile)
                .testFile(true)
                .build();
    }

    public boolean hasTests() {
        for (Map.Entry<TypeId, TypeDeclaration> entry :
                generatorContext.getTypeDeclarations().entrySet()) {
            TypeDeclaration typeDeclaration = entry.getValue();
            if (!typeDeclaration.getShape().isUndiscriminatedUnion()) {
                continue;
            }
            UndiscriminatedUnionTypeDeclaration union =
                    typeDeclaration.getShape().getUndiscriminatedUnion().get();
            if (getTestableVariants(union).size() >= 2) {
                return true;
            }
        }
        return false;
    }

    private Optional<MethodSpec> buildTestMethod(
            ClassName testAnnotation,
            ClassName objectMappersClassName,
            ClassName unionClassName,
            TestableVariant variant,
            List<TestableVariant> allVariants) {

        // Only generate a test when every earlier variant's guard will fail for this variant's payload.
        // A guard fails when the payload is missing at least one of that variant's required keys.
        boolean isDistinguishable = true;
        for (TestableVariant other : allVariants) {
            if (other == variant) {
                break;
            }
            if (variant.requiredKeys.containsAll(other.requiredKeys)) {
                isDistinguishable = false;
                break;
            }
        }
        if (!isDistinguishable) {
            return Optional.empty();
        }

        String methodName = "test" + unionClassName.simpleName() + "_" + variant.variantClassName.simpleName();

        MethodSpec.Builder builder = MethodSpec.methodBuilder(methodName)
                .addAnnotation(testAnnotation)
                .addModifiers(Modifier.PUBLIC)
                .addException(Exception.class);

        // Build JSON string with required keys
        StringBuilder jsonBuilder = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<String, String> keyValue : variant.jsonKeyValues.entrySet()) {
            if (!first) {
                jsonBuilder.append(",");
            }
            jsonBuilder.append("\\\"").append(keyValue.getKey()).append("\\\":");
            jsonBuilder.append(keyValue.getValue());
            first = false;
        }
        jsonBuilder.append("}");

        builder.addStatement(
                "$T json = $S",
                ClassName.get(String.class),
                jsonBuilder.toString().replace("\\\"", "\""));
        builder.addStatement(
                "$T union = $T.JSON_MAPPER.readValue(json, $T.class)",
                unionClassName,
                objectMappersClassName,
                unionClassName);
        builder.addStatement(
                "assertTrue(union.get() instanceof $T, $S)",
                variant.variantClassName,
                "Expected " + variant.variantClassName.simpleName() + " but got different variant");

        return Optional.of(builder.build());
    }

    private List<TestableVariant> getTestableVariants(UndiscriminatedUnionTypeDeclaration union) {
        List<TestableVariant> variants = new ArrayList<>();
        for (UndiscriminatedUnionMember member : union.getMembers()) {
            if (!member.getType().isNamed()) {
                continue;
            }
            // Walk alias chains until we land on an object declaration (or bail).
            // Use the resolved object declaration's name for variantClassName because
            // when wrappedAliases is false (the default), alias types have no generated class.
            TypeDeclaration objectDeclaration =
                    resolveToObjectDeclaration(member.getType().getNamed().get().getTypeId());
            if (objectDeclaration == null) {
                continue;
            }
            ObjectTypeDeclaration objectType =
                    objectDeclaration.getShape().getObject().get();
            Map<String, String> jsonKeyValues = new LinkedHashMap<>();
            Set<String> requiredKeys = new LinkedHashSet<>();
            if (!collectRequiredJsonKeyValues(objectType, jsonKeyValues, requiredKeys)) {
                continue;
            }
            if (requiredKeys.isEmpty()) {
                continue;
            }
            ClassName variantClassName =
                    generatorContext.getPoetClassNameFactory().getTypeClassName(objectDeclaration.getName());
            variants.add(new TestableVariant(variantClassName, requiredKeys, jsonKeyValues));
        }
        return variants;
    }

    /**
     * Walks alias chains starting at {@code typeId}, returning the first object-shaped declaration encountered. Returns
     * {@code null} if the chain ends in a non-object shape (primitive, container, enum, union, etc.). Guards against
     * alias cycles with a visited-set on TypeId.
     */
    private TypeDeclaration resolveToObjectDeclaration(TypeId typeId) {
        Set<TypeId> visited = new LinkedHashSet<>();
        while (typeId != null && visited.add(typeId)) {
            TypeDeclaration typeDeclaration =
                    generatorContext.getTypeDeclarations().get(typeId);
            if (typeDeclaration == null) {
                return null;
            }
            if (typeDeclaration.getShape().isObject()) {
                return typeDeclaration;
            }
            if (!typeDeclaration.getShape().isAlias()) {
                return null;
            }
            com.fern.ir.model.types.ResolvedTypeReference resolved =
                    typeDeclaration.getShape().getAlias().get().getResolvedType();
            if (!resolved.isNamed()) {
                return null;
            }
            typeId = resolved.getNamed().get().getName().getTypeId();
        }
        return null;
    }

    /**
     * Collects required wire keys and their JSON test values. Returns false if any required property has a type we
     * cannot generate a safe test value for.
     */
    private boolean collectRequiredJsonKeyValues(
            ObjectTypeDeclaration objectType, Map<String, String> jsonKeyValues, Set<String> requiredKeys) {
        for (ObjectProperty property : objectType.getProperties()) {
            if (!isRequiredProperty(property)) {
                continue;
            }
            String wireKey = NameUtils.getWireValue(property.getName());
            String jsonValue = getJsonTestValue(property.getValueType());
            if (jsonValue == null) {
                return false;
            }
            jsonKeyValues.put(wireKey, jsonValue);
            requiredKeys.add(wireKey);
        }
        for (DeclaredTypeName extendedType : objectType.getExtends()) {
            TypeDeclaration extDeclaration =
                    generatorContext.getTypeDeclarations().get(extendedType.getTypeId());
            if (extDeclaration != null && extDeclaration.getShape().isObject()) {
                if (!collectRequiredJsonKeyValues(
                        extDeclaration.getShape().getObject().get(), jsonKeyValues, requiredKeys)) {
                    return false;
                }
            }
        }
        return true;
    }

    private static boolean isRequiredProperty(ObjectProperty property) {
        com.fern.ir.model.types.TypeReference valueType = property.getValueType();
        if (valueType.isContainer()) {
            ContainerType container = valueType.getContainer().get();
            if (container.isOptional() || container.isNullable() || container.isLiteral()) {
                return false;
            }
        }
        return true;
    }

    private String getJsonTestValue(com.fern.ir.model.types.TypeReference typeRef) {
        if (typeRef.isPrimitive()) {
            return typeRef.getPrimitive().get().getV1().visit(new PrimitiveJsonValueVisitor());
        }
        if (typeRef.isContainer()) {
            ContainerType container = typeRef.getContainer().get();
            if (container.isList() || container.isSet()) {
                return "[]";
            }
            if (container.isMap()) {
                return "{}";
            }
            return null;
        }
        if (typeRef.isNamed()) {
            TypeId typeId = typeRef.getNamed().get().getTypeId();
            TypeDeclaration decl = generatorContext.getTypeDeclarations().get(typeId);
            if (decl != null && decl.getShape().isObject()) {
                return "{}";
            }
            if (decl != null && decl.getShape().isAlias()) {
                com.fern.ir.model.types.ResolvedTypeReference resolved =
                        decl.getShape().getAlias().get().getResolvedType();
                if (resolved.isPrimitive()) {
                    return resolved.getPrimitive().get().getV1().visit(new PrimitiveJsonValueVisitor());
                }
                if (resolved.isContainer()) {
                    ContainerType container = resolved.getContainer().get();
                    if (container.isList() || container.isSet()) {
                        return "[]";
                    }
                    if (container.isMap()) {
                        return "{}";
                    }
                }
                if (resolved.isUnknown()) {
                    return "{}";
                }
                return null;
            }
            // Enums, unions, etc. are complex — skip
            return null;
        }
        if (typeRef.isUnknown()) {
            return "{}";
        }
        return null;
    }

    private static final class PrimitiveJsonValueVisitor implements PrimitiveTypeV1.Visitor<String> {
        @Override
        public String visitInteger() {
            return "1";
        }

        @Override
        public String visitDouble() {
            return "1.1";
        }

        @Override
        public String visitString() {
            return "\"test\"";
        }

        @Override
        public String visitBoolean() {
            return "true";
        }

        @Override
        public String visitLong() {
            return "1";
        }

        @Override
        public String visitDateTime() {
            return "\"2024-01-01T00:00:00Z\"";
        }

        @Override
        public String visitDate() {
            return "\"2024-01-01\"";
        }

        @Override
        public String visitUuid() {
            return "\"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32\"";
        }

        @Override
        public String visitBase64() {
            return "\"dGVzdA==\"";
        }

        @Override
        public String visitBigInteger() {
            return "\"1\"";
        }

        @Override
        public String visitUint() {
            return "1";
        }

        @Override
        public String visitUint64() {
            return "1";
        }

        @Override
        public String visitFloat() {
            return "1.1";
        }

        @Override
        public String visitDateTimeRfc2822() {
            return "\"Sat, 01 Jan 2024 00:00:00 +0000\"";
        }

        @Override
        public String visitUnknown(String unknownType) {
            return null;
        }
    }

    private static final class TestableVariant {
        final ClassName variantClassName;
        final Set<String> requiredKeys;
        final Map<String, String> jsonKeyValues;

        TestableVariant(ClassName variantClassName, Set<String> requiredKeys, Map<String, String> jsonKeyValues) {
            this.variantClassName = variantClassName;
            this.requiredKeys = requiredKeys;
            this.jsonKeyValues = jsonKeyValues;
        }
    }
}
