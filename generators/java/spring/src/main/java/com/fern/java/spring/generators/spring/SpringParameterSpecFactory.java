package com.fern.java.spring.generators.spring;

import com.fern.ir.model.http.HttpHeader;
import com.fern.ir.model.http.PathParameter;
import com.fern.ir.model.http.QueryParameter;
import com.fern.ir.model.types.TypeReference;
import com.fern.java.AbstractGeneratorContext;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.TypeName;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

public final class SpringParameterSpecFactory {

    private final AbstractGeneratorContext<?, ?> generatorContext;

    public SpringParameterSpecFactory(AbstractGeneratorContext<?, ?> generatorContext) {
        this.generatorContext = generatorContext;
    }

    public ParameterSpec getHeaderParameterSpec(HttpHeader header) {
        return getParameterSpec(
                RequestHeader.class,
                header.getName().getWireValue(),
                header.getName().getName().getCamelCase().getSafeName(),
                header.getValueType());
    }

    public ParameterSpec getPathParameterSpec(PathParameter pathParameter) {
        return getParameterSpec(
                PathVariable.class,
                pathParameter.getName().getOriginalName(),
                pathParameter.getName().getCamelCase().getSafeName(),
                pathParameter.getValueType());
    }

    public ParameterSpec getQueryParameterSpec(QueryParameter queryParameter) {
        return getParameterSpec(
                RequestParam.class,
                queryParameter.getName().getWireValue(),
                queryParameter.getName().getName().getCamelCase().getSafeName(),
                queryParameter.getValueType());
    }

    private <T> ParameterSpec getParameterSpec(
            Class<T> paramClass, String annotationValue, String paramName, TypeReference paramType) {
        TypeName typeName = generatorContext.getPoetTypeNameMapper().convertToTypeName(false, paramType);
        return ParameterSpec.builder(typeName, paramName)
                .addAnnotation(AnnotationSpec.builder(paramClass)
                        .addMember("value", "$S", annotationValue)
                        .build())
                .build();
    }
}
