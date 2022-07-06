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
package com.fern.spring;

import com.fern.codegen.GeneratorContext;
import com.fern.codegen.payload.GeneratedFilePayload;
import com.fern.codegen.payload.Payload;
import com.fern.codegen.payload.TypeNamePayload;
import com.fern.codegen.payload.VoidPayload;
import com.fern.codegen.utils.VariableNameUtils;
import com.fern.types.TypeReference;
import com.fern.types.services.HttpHeader;
import com.fern.types.services.PathParameter;
import com.fern.types.services.QueryParameter;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.TypeName;
import java.util.Optional;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

public final class SpringServiceGeneratorUtils {

    private final GeneratorContext generatorContext;

    public SpringServiceGeneratorUtils(GeneratorContext generatorContext) {
        this.generatorContext = generatorContext;
    }

    public ParameterSpec getHeaderParameterSpec(HttpHeader header) {
        return getParameterSpec(
                RequestHeader.class,
                header.header(),
                VariableNameUtils.getVariableNameFromHeader(header),
                header.valueType());
    }

    public ParameterSpec getPathParameterSpec(PathParameter pathParameter) {
        return getParameterSpec(
                PathVariable.class, pathParameter.key(), pathParameter.key(), pathParameter.valueType());
    }

    public ParameterSpec getQueryParameterSpec(QueryParameter queryParameter) {
        return getParameterSpec(
                RequestParam.class, queryParameter.key(), queryParameter.key(), queryParameter.valueType());
    }

    private <T> ParameterSpec getParameterSpec(
            Class<T> paramClass, String annotationValue, String paramName, TypeReference paramType) {
        TypeName typeName = generatorContext.getClassNameUtils().getTypeNameFromTypeReference(false, paramType);
        return ParameterSpec.builder(typeName, paramName)
                .addAnnotation(AnnotationSpec.builder(paramClass)
                        .addMember("value", "$S", annotationValue)
                        .build())
                .build();
    }

    public Optional<TypeName> getPayloadTypeName(Payload payload) {
        if (payload instanceof VoidPayload) {
            return Optional.empty();
        } else if (payload instanceof GeneratedFilePayload) {
            return Optional.of(((GeneratedFilePayload) payload).generatedFile().className());
        } else if (payload instanceof TypeNamePayload) {
            return Optional.of(((TypeNamePayload) payload).typeName());
        }
        throw new IllegalStateException(
                "Encountered unknown payload type: " + payload.getClass().getSimpleName());
    }
}
