/*
 * (c) Copyright 2022 Birch Solutions Inc. All rights reserved.
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

package com.fern.java.spring.generators.spring;

import com.fern.irV20.model.http.HttpHeader;
import com.fern.irV20.model.http.PathParameter;
import com.fern.irV20.model.http.QueryParameter;
import com.fern.irV20.model.types.TypeReference;
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
