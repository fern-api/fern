package com.fern.java.generators;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonUnwrapped;
import com.fasterxml.jackson.annotation.JsonValue;
import com.fern.ir.model.commons.NameAndWireValue;
import com.fern.ir.model.constants.Constants;
import com.fern.ir.model.types.DeclaredTypeName;
import com.fern.ir.model.types.SingleUnionType;
import com.fern.ir.model.types.SingleUnionTypeProperties;
import com.fern.ir.model.types.SingleUnionTypeProperty;
import com.fern.ir.model.types.TypeReference;
import com.fern.ir.model.types.UnionTypeDeclaration;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.FernJavaAnnotations;
import com.fern.java.generators.union.UnionSubType;
import com.fern.java.generators.union.UnionTypeSpecGenerator;
import com.fern.java.output.GeneratedJavaFile;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import javax.lang.model.element.Modifier;

public final class UnionGenerator extends AbstractFileGenerator {

    private final UnionTypeDeclaration unionTypeDeclaration;

    public UnionGenerator(
            ClassName className,
            AbstractGeneratorContext<?, ?> generatorContext,
            UnionTypeDeclaration unionTypeDeclaration) {
        super(className, generatorContext);
        this.unionTypeDeclaration = unionTypeDeclaration;
    }

    @Override
    public GeneratedJavaFile generateFile() {
        List<ModelUnionSubTypes> unionSubTypes = unionTypeDeclaration.getTypes().stream()
                .map(singleUnionType -> new ModelUnionSubTypes(className, singleUnionType))
                .collect(Collectors.toList());
        ModelUnionUnknownSubType unknownSubType = new ModelUnionUnknownSubType(className);
        ModelUnionTypeSpecGenerator unionTypeSpecGenerator = new ModelUnionTypeSpecGenerator(
                className,
                unionSubTypes,
                unknownSubType,
                generatorContext.getIr().getConstants());
        TypeSpec unionTypeSpec = unionTypeSpecGenerator.generateUnionTypeSpec();
        JavaFile unionFile =
                JavaFile.builder(className.packageName(), unionTypeSpec).build();
        return GeneratedJavaFile.builder()
                .className(className)
                .javaFile(unionFile)
                .build();
    }

    private final class ModelUnionTypeSpecGenerator extends UnionTypeSpecGenerator {

        private ModelUnionTypeSpecGenerator(
                ClassName unionClassName,
                List<? extends UnionSubType> subTypes,
                UnionSubType unionSubType,
                Constants fernConstants) {
            super(
                    unionClassName,
                    subTypes,
                    unionSubType,
                    fernConstants,
                    true,
                    unionTypeDeclaration.getDiscriminant().getWireValue());
        }

        @Override
        public List<FieldSpec> getAdditionalFieldSpecs() {
            return Collections.emptyList();
        }

        @Override
        public TypeSpec build(TypeSpec.Builder unionBuilder) {
            return unionBuilder
                    .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                    .addMethod(MethodSpec.methodBuilder("getValue")
                            .addAnnotation(JsonValue.class)
                            .addModifiers(Modifier.PRIVATE)
                            .returns(getValueInterfaceClassName())
                            .addStatement("return this.$L", getValueFieldName())
                            .build())
                    .build();
        }
    }

    private final class ModelUnionSubTypes extends UnionSubType {

        private final SingleUnionType singleUnionType;
        private final Optional<TypeName> unionSubTypeTypeName;
        private final Optional<FieldSpec> valueFieldSpec;

        private ModelUnionSubTypes(ClassName unionClassName, SingleUnionType singleUnionType) {
            super(unionClassName);
            this.singleUnionType = singleUnionType;
            this.valueFieldSpec = getValueField();
            this.unionSubTypeTypeName = valueFieldSpec.map(fieldSpec -> fieldSpec.type);
        }

        @Override
        public Optional<NameAndWireValue> getDiscriminant() {
            return Optional.of(this.singleUnionType.getDiscriminantValue());
        }

        @Override
        public String getVisitMethodName() {
            return "visit"
                    + this.singleUnionType
                            .getDiscriminantValue()
                            .getName()
                            .getPascalCase()
                            .getUnsafeName();
        }

        @Override
        public String getIsMethodName() {
            return "is"
                    + this.singleUnionType
                            .getDiscriminantValue()
                            .getName()
                            .getPascalCase()
                            .getUnsafeName();
        }

        @Override
        public String getGetMethodName() {
            return "get"
                    + this.singleUnionType
                            .getDiscriminantValue()
                            .getName()
                            .getPascalCase()
                            .getUnsafeName();
        }

        @Override
        public String getVisitorParameterName() {
            return this.singleUnionType
                    .getDiscriminantValue()
                    .getName()
                    .getCamelCase()
                    .getSafeName();
        }

        @Override
        public Optional<TypeName> getUnionSubTypeTypeName() {
            return unionSubTypeTypeName;
        }

        @Override
        public ClassName getUnionSubTypeWrapperClass() {
            return getUnionClassName()
                    .nestedClass(singleUnionType
                                    .getDiscriminantValue()
                                    .getName()
                                    .getPascalCase()
                                    .getSafeName() + "Value");
        }

        @Override
        public List<FieldSpec> getFieldSpecs() {
            return valueFieldSpec.map(Collections::singletonList).orElseGet(Collections::emptyList);
        }

        @Override
        public List<MethodSpec> getConstructors() {
            List<MethodSpec> constructors = new ArrayList<>();
            singleUnionType.getShape().visit(new SingleUnionTypeProperties.Visitor<Void>() {

                @Override
                public Void visitSamePropertiesAsObject(DeclaredTypeName samePropertiesAsObject) {
                    constructors.add(MethodSpec.constructorBuilder()
                            .addModifiers(Modifier.PRIVATE)
                            .addAnnotation(FernJavaAnnotations.jacksonPropertiesCreator())
                            .build());
                    constructors.add(MethodSpec.constructorBuilder()
                            .addModifiers(Modifier.PRIVATE)
                            .addParameter(ParameterSpec.builder(
                                            generatorContext
                                                    .getPoetTypeNameMapper()
                                                    .convertToTypeName(
                                                            true, TypeReference.named(samePropertiesAsObject)),
                                            "value")
                                    .build())
                            .addStatement("this.$L = $L", "value", "value")
                            .build());
                    return null;
                }

                @Override
                public Void visitSingleProperty(SingleUnionTypeProperty singleProperty) {
                    String parameterName =
                            singleProperty.getName().getName().getCamelCase().getSafeName();
                    constructors.add(MethodSpec.constructorBuilder()
                            .addModifiers(Modifier.PRIVATE)
                            .addAnnotation(FernJavaAnnotations.jacksonPropertiesCreator())
                            .addParameter(ParameterSpec.builder(
                                            generatorContext
                                                    .getPoetTypeNameMapper()
                                                    .convertToTypeName(true, singleProperty.getType()),
                                            parameterName)
                                    .addAnnotation(AnnotationSpec.builder(JsonProperty.class)
                                            .addMember(
                                                    "value",
                                                    "$S",
                                                    singleProperty.getName().getWireValue())
                                            .build())
                                    .build())
                            .addStatement("this.$L = $L", parameterName, parameterName)
                            .build());
                    return null;
                }

                @Override
                public Void visitNoProperties() {
                    constructors.add(MethodSpec.constructorBuilder()
                            .addModifiers(Modifier.PRIVATE)
                            .addAnnotation(FernJavaAnnotations.jacksonPropertiesCreator())
                            .build());
                    return null;
                }

                @Override
                public Void _visitUnknown(Object unknown) {
                    return null;
                }
            });

            return constructors;
        }

        @Override
        public String getValueFieldName() {
            return valueFieldSpec.map(fieldSpec -> fieldSpec.name).orElse("value");
        }

        @Override
        public Optional<MethodSpec> getStaticFactory() {
            MethodSpec.Builder staticFactoryBuilder = MethodSpec.methodBuilder(getVisitorParameterName())
                    .addModifiers(Modifier.PUBLIC, Modifier.STATIC)
                    .returns(getUnionClassName());
            if (getUnionSubTypeTypeName().isPresent()) {
                staticFactoryBuilder
                        .addParameter(getUnionSubTypeTypeName().get(), getValueFieldName())
                        .addStatement(
                                "return new $T(new $T($L))",
                                getUnionClassName(),
                                getUnionSubTypeWrapperClass(),
                                getValueFieldName());
            } else {
                staticFactoryBuilder.addStatement(
                        "return new $T(new $T())", getUnionClassName(), getUnionSubTypeWrapperClass());
            }
            return Optional.of(staticFactoryBuilder.build());
        }

        private Optional<FieldSpec> getValueField() {
            return singleUnionType.getShape().visit(new SingleUnionTypeProperties.Visitor<>() {

                @Override
                public Optional<FieldSpec> visitSamePropertiesAsObject(DeclaredTypeName samePropertiesAsObject) {
                    return Optional.of(FieldSpec.builder(
                                    generatorContext
                                            .getPoetTypeNameMapper()
                                            .convertToTypeName(true, TypeReference.named(samePropertiesAsObject)),
                                    "value",
                                    Modifier.PRIVATE)
                            .addAnnotation(JsonUnwrapped.class)
                            .build());
                }

                @Override
                public Optional<FieldSpec> visitSingleProperty(SingleUnionTypeProperty singleProperty) {
                    String fieldName =
                            singleProperty.getName().getName().getCamelCase().getSafeName();
                    return Optional.of(FieldSpec.builder(
                                    generatorContext
                                            .getPoetTypeNameMapper()
                                            .convertToTypeName(true, singleProperty.getType()),
                                    fieldName,
                                    Modifier.PRIVATE)
                            .addAnnotation(AnnotationSpec.builder(JsonProperty.class)
                                    .addMember(
                                            "value",
                                            "$S",
                                            singleProperty.getName().getWireValue())
                                    .build())
                            .build());
                }

                @Override
                public Optional<FieldSpec> visitNoProperties() {
                    return Optional.empty();
                }

                @Override
                public Optional<FieldSpec> _visitUnknown(Object unknown) {
                    return Optional.empty();
                }
            });
        }
    }

    private static final class ModelUnionUnknownSubType extends UnionSubType {

        private ModelUnionUnknownSubType(ClassName unionClassName) {
            super(unionClassName);
        }

        @Override
        public Optional<NameAndWireValue> getDiscriminant() {
            return Optional.empty();
        }

        @Override
        public String getVisitMethodName() {
            return "_visitUnknown";
        }

        @Override
        public String getIsMethodName() {
            return "_isUnknown";
        }

        @Override
        public String getGetMethodName() {
            return "_getUnknown";
        }

        @Override
        public String getVisitorParameterName() {
            return "unknownType";
        }

        @Override
        public Optional<TypeName> getUnionSubTypeTypeName() {
            return Optional.of(ClassName.get(Object.class));
        }

        @Override
        public ClassName getUnionSubTypeWrapperClass() {
            return getUnionClassName().nestedClass("_UnknownValue");
        }

        @Override
        public List<FieldSpec> getFieldSpecs() {
            return List.of(
                    FieldSpec.builder(String.class, "type", Modifier.PRIVATE).build(),
                    FieldSpec.builder(Object.class, getValueFieldName(), Modifier.PRIVATE)
                            .addAnnotation(JsonValue.class)
                            .build());
        }

        @Override
        public List<MethodSpec> getConstructors() {
            MethodSpec.Builder fromJsonConstructorBuilder = MethodSpec.constructorBuilder()
                    .addModifiers(Modifier.PRIVATE)
                    .addAnnotation(FernJavaAnnotations.jacksonPropertiesCreator());
            List<ParameterSpec> parameterSpecs = new ArrayList<>();
            parameterSpecs.add(ParameterSpec.builder(getUnionSubTypeTypeName().get(), getValueFieldName())
                    .addAnnotation(AnnotationSpec.builder(JsonProperty.class)
                            .addMember("value", "$S", getValueFieldName())
                            .build())
                    .build());
            return Collections.singletonList(
                    fromJsonConstructorBuilder.addParameters(parameterSpecs).build());
        }

        @Override
        public Optional<MethodSpec> getStaticFactory() {
            return Optional.empty();
        }
    }
}
