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

package com.fern.java;

import com.fern.ir.model.http.HttpHeader;
import com.fern.ir.model.ir.IntermediateRepresentation;
import com.fern.ir.model.types.ContainerType;
import com.squareup.javapoet.ParameterSpec;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public final class GlobalHeaders {

    private final List<HttpHeader> requiredGlobalHeaders = new ArrayList<>();
    private final List<HttpHeader> optionalGlobalHeaders = new ArrayList<>();
    private final List<ParameterSpec> requiredGlobalHeaderParameters = new ArrayList<>();
    private final List<ParameterSpec> optionalHeaderParameters = new ArrayList<>();
    private final String commaDelimitedGlobalHeaderParams;

    public GlobalHeaders(IntermediateRepresentation ir, PoetTypeNameMapper poetTypeNameMapper) {
        ir.getHeaders().forEach(httpHeader -> {
            boolean isOptional = httpHeader
                    .getValueType()
                    .getContainer()
                    .map(ContainerType::isOptional)
                    .orElse(false);
            ParameterSpec parameterSpec = ParameterSpec.builder(
                            poetTypeNameMapper.convertToTypeName(true, httpHeader.getValueType()),
                            httpHeader.getName().getName().getCamelCase().getSafeName())
                    .build();
            if (isOptional) {
                optionalGlobalHeaders.add(httpHeader);
                optionalHeaderParameters.add(parameterSpec);
            } else {
                requiredGlobalHeaders.add(httpHeader);
                requiredGlobalHeaderParameters.add(parameterSpec);
            }
        });
        this.commaDelimitedGlobalHeaderParams = requiredGlobalHeaderParameters.stream()
                .map(parameterSpec -> parameterSpec.name)
                .collect(Collectors.joining(", "));
    }

    public List<HttpHeader> getOptionalGlobalHeaders() {
        return optionalGlobalHeaders;
    }

    public List<HttpHeader> getRequiredGlobalHeaders() {
        return requiredGlobalHeaders;
    }

    public List<ParameterSpec> getOptionalHeaderParameters() {
        return optionalHeaderParameters;
    }

    public List<ParameterSpec> getRequiredGlobalHeaderParameters() {
        return requiredGlobalHeaderParameters;
    }

    public String suffixRequiredGlobalHeaderParams(String params) {
        if (commaDelimitedGlobalHeaderParams.isBlank()) {
            return params;
        }
        return params + ", " + commaDelimitedGlobalHeaderParams;
    }
}
