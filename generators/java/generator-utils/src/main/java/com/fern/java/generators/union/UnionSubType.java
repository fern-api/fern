package com.fern.java.generators.union;

import com.fasterxml.jackson.annotation.JsonTypeName;
import com.fern.ir.model.commons.NameAndWireValue;
import com.fern.java.ObjectMethodFactory;
import com.fern.java.ObjectMethodFactory.EqualsMethod;
import com.fern.java.PoetTypeNameMapper;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import com.squareup.javapoet.TypeSpec;
import com.squareup.javapoet.TypeVariableName;
import java.util.List;
import java.util.Optional;
import javax.lang.model.element.Modifier;

public abstract class UnionSubType {

    private static final String VISITOR_CLASS_NAME = "Visitor";

    private static final TypeVariableName VISITOR_RETURN_TYPE = TypeVariableName.get("T");

    private final ClassName unionClassName;
    private final ParameterizedTypeName visitorInterfaceClassName;

    protected final PoetTypeNameMapper poetTypeNameMapper;

    public UnionSubType(ClassName unionClassName, PoetTypeNameMapper poetTypeNameMapper) {
        this.unionClassName = unionClassName;
        this.visitorInterfaceClassName =
                ParameterizedTypeName.get(unionClassName.nestedClass(VISITOR_CLASS_NAME), VISITOR_RETURN_TYPE);
        this.poetTypeNameMapper = poetTypeNameMapper;
    }

    public final ClassName getUnionClassName() {
        return unionClassName;
    }

    public abstract Optional<NameAndWireValue> getDiscriminant();

    public abstract Optional<TypeName> getUnionSubTypeTypeName();

    public abstract ClassName getUnionSubTypeWrapperClass();

    public abstract List<FieldSpec> getFieldSpecs();

    public abstract List<MethodSpec> getConstructors();

    @SuppressWarnings("checkstyle:DesignForExtension")
    public String getValueFieldName() {
        return "value";
    }

    public abstract Optional<MethodSpec> getStaticFactory();

    public abstract String getVisitMethodName();

    public abstract String getIsMethodName();

    @SuppressWarnings("checkstyle:DesignForExtension")
    public abstract String getGetMethodName();

    public abstract String getVisitorParameterName();

    public final MethodSpec getVisitorInterfaceVisitMethod() {
        MethodSpec.Builder visitMethodBuilder = MethodSpec.methodBuilder(getVisitMethodName())
                .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT)
                .returns(TypeVariableName.get("T"));
        if (getUnionSubTypeTypeName().isPresent()) {
            visitMethodBuilder.addParameter(
                    ParameterSpec.builder(getUnionSubTypeTypeName().get(), getVisitorParameterName())
                            .build());
        }
        return visitMethodBuilder.build();
    }

    public final MethodSpec getVisitMethod() {
        MethodSpec.Builder visitMethodBuilder = MethodSpec.methodBuilder("visit")
                .addModifiers(Modifier.PUBLIC)
                .addAnnotation(ClassName.get("", "java.lang.Override"))
                .addTypeVariable(VISITOR_RETURN_TYPE)
                .returns(VISITOR_RETURN_TYPE)
                .addParameter(ParameterSpec.builder(visitorInterfaceClassName, "visitor")
                        .build());
        if (getUnionSubTypeTypeName().isPresent()) {
            visitMethodBuilder.addStatement(
                    "return $L.$N($L)", "visitor", getVisitorInterfaceVisitMethod(), getValueFieldName());
        } else {
            visitMethodBuilder.addStatement("return $L.$N()", "visitor", getVisitorInterfaceVisitMethod());
        }
        return visitMethodBuilder.build();
    }

    public final EqualsMethod getEqualsMethod() {
        return ObjectMethodFactory.createEqualsMethod(getUnionSubTypeWrapperClass(), getFieldSpecs());
    }

    public final Optional<MethodSpec> getHashCodeMethod() {
        return ObjectMethodFactory.createHashCodeMethod(getFieldSpecs());
    }

    public final MethodSpec getToStringMethod() {
        return ObjectMethodFactory.createToStringMethodFromFieldSpecs(unionClassName, getFieldSpecs());
    }

    public final TypeSpec getUnionSubTypeWrapper(ClassName unionWrapperInterface) {
        ClassName subTypeWrapperClassName = getUnionSubTypeWrapperClass();
        TypeSpec.Builder unionSubTypeBuilder = TypeSpec.classBuilder(subTypeWrapperClassName)
                .addModifiers(Modifier.PRIVATE, Modifier.STATIC, Modifier.FINAL)
                .addSuperinterface(unionWrapperInterface);
        if (getDiscriminant().isPresent()) {
            unionSubTypeBuilder.addAnnotation(AnnotationSpec.builder(JsonTypeName.class)
                    .addMember("value", "$S", getDiscriminant().get().getWireValue())
                    .build());
        }
        EqualsMethod equalsMethod = getEqualsMethod();
        unionSubTypeBuilder
                .addFields(getFieldSpecs())
                .addMethods(getConstructors())
                .addMethod(getVisitMethod())
                .addMethod(equalsMethod.getEqualsMethodSpec());
        equalsMethod.getEqualToMethodSpec().ifPresent(unionSubTypeBuilder::addMethod);
        getHashCodeMethod().ifPresent(unionSubTypeBuilder::addMethod);
        return unionSubTypeBuilder.addMethod(getToStringMethod()).build();
    }
}
