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
