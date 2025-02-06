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

package com.fern.java.client.generators.endpoint;

import com.fern.ir.model.http.*;
import com.fern.ir.model.variables.VariableId;
import com.fern.java.client.GeneratedClientOptions;
import com.fern.java.client.JavaSdkCustomConfig;
import com.fern.java.generators.object.EnrichedObjectProperty;
import com.fern.java.immutables.StagedBuilderImmutablesStyle;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Stream;
import okhttp3.HttpUrl;
import org.immutables.value.Value;

@SuppressWarnings({"checkstyle:JavadocStyle", "checkstyle:SummaryJavadoc"})
public final class HttpUrlBuilder {
    private final String httpUrlname;
    private final String requestName;
    private final CodeBlock baseUrlReference;
    private final HttpEndpoint httpEndpoint;
    private final HttpService httpService;
    private final FieldSpec clientOptionsField;
    private final GeneratedClientOptions generatedClientOptions;
    private final Map<String, PathParamInfo> servicePathParameters;
    private final Map<String, PathParamInfo> endpointPathParameters;
    private final boolean hasOptionalPathParams;
    private final boolean inlinePathParams;

    public HttpUrlBuilder(
            String httpUrlname,
            String requestName,
            FieldSpec clientOptionsField,
            GeneratedClientOptions generatedClientOptions,
            CodeBlock baseUrlReference,
            HttpEndpoint httpEndpoint,
            HttpService httpService,
            Map<String, PathParamInfo> servicePathParameters,
            Map<String, PathParamInfo> endpointPathParameters,
            JavaSdkCustomConfig config) {
        this.httpUrlname = httpUrlname;
        this.requestName = requestName;
        this.clientOptionsField = clientOptionsField;
        this.generatedClientOptions = generatedClientOptions;
        this.baseUrlReference = baseUrlReference;
        this.httpEndpoint = httpEndpoint;
        this.httpService = httpService;
        this.servicePathParameters = servicePathParameters;
        this.endpointPathParameters = endpointPathParameters;
        this.hasOptionalPathParams = Stream.concat(
                        servicePathParameters.values().stream(), endpointPathParameters.values().stream())
                .anyMatch(pathParamInfo ->
                        pathParamInfo.irParam().getValueType().getContainer().isPresent()
                                && pathParamInfo
                                        .irParam()
                                        .getValueType()
                                        .getContainer()
                                        .get()
                                        .isOptional());
        this.inlinePathParams = config.inlinePathParameters()
                && httpEndpoint.getSdkRequest().isPresent()
                && httpEndpoint.getSdkRequest().get().getShape().isWrapper()
                && (httpEndpoint
                                .getSdkRequest()
                                .get()
                                .getShape()
                                .getWrapper()
                                .get()
                                .getIncludePathParameters()
                                .orElse(false)
                        || httpEndpoint
                                .getSdkRequest()
                                .get()
                                .getShape()
                                .getWrapper()
                                .get()
                                .getOnlyPathParameters()
                                .orElse(false));
    }

    public GeneratedHttpUrl generateBuilder(List<EnrichedObjectProperty> queryParamProperties) {
        boolean shouldInline = queryParamProperties.isEmpty() && !hasOptionalPathParams;
        if (shouldInline) {
            return generateInlineableCodeBlock();
        } else {
            return generateUnInlineableCodeBlock(queryParamProperties);
        }
    }

    private GeneratedHttpUrl generateInlineableCodeBlock() {
        CodeBlock.Builder codeBlock = CodeBlock.builder()
                .add("$T $L = $T.parse(", HttpUrl.class, httpUrlname, HttpUrl.class)
                .add(baseUrlReference)
                .add(").newBuilder()\n")
                .indent();
        addHttpPathToCodeBlock(codeBlock, httpService.getBasePath(), servicePathParameters, true);
        addHttpPathToCodeBlock(codeBlock, httpEndpoint.getPath(), endpointPathParameters, true);
        codeBlock.add(".build();\n").unindent();
        return GeneratedHttpUrl.builder()
                .initialization(codeBlock.build())
                .inlineableBuild(CodeBlock.of(httpUrlname))
                .build();
    }

    private GeneratedHttpUrl generateUnInlineableCodeBlock(List<EnrichedObjectProperty> queryParamProperties) {
        CodeBlock.Builder codeBlock = CodeBlock.builder()
                .add("$T $L = $T.parse(", HttpUrl.Builder.class, httpUrlname, HttpUrl.class)
                .add(baseUrlReference)
                .add(").newBuilder()\n")
                .indent();
        addHttpPathToCodeBlock(codeBlock, httpService.getBasePath(), servicePathParameters, true);
        boolean endedWithStatement =
                addHttpPathToCodeBlock(codeBlock, httpEndpoint.getPath(), endpointPathParameters, false);
        if (!endedWithStatement) {
            codeBlock.add(CodeBlock.of(";"));
        }
        queryParamProperties.forEach(queryParamProperty -> {
            boolean isOptional = isTypeNameOptional(queryParamProperty.poetTypeName());
            if (isOptional) {
                codeBlock.beginControlFlow(
                        "if ($L.$N().isPresent())", requestName, queryParamProperty.getterProperty());
            }
            codeBlock.addStatement(
                    "$L.addQueryParameter($S, $L)",
                    httpUrlname,
                    queryParamProperty.wireKey().get(),
                    PoetTypeNameStringifier.stringify(
                            CodeBlock.of(
                                            "$L.$N()" + (isOptional ? ".get()" : ""),
                                            requestName,
                                            queryParamProperty.getterProperty())
                                    .toString(),
                            queryParamProperty.poetTypeName()));
            if (isOptional) {
                codeBlock.endControlFlow();
            }
        });
        return GeneratedHttpUrl.builder()
                .initialization(codeBlock.build())
                .inlineableBuild(CodeBlock.of("$L.build()", httpUrlname))
                .build();
    }

    private boolean addHttpPathToCodeBlock(
            CodeBlock.Builder codeBlock,
            HttpPath httpPath,
            Map<String, PathParamInfo> pathParameters,
            boolean addNewLine) {
        boolean endedWithStatement = false;
        String strippedHead = stripLeadingAndTrailingSlash(httpPath.getHead());
        if (!strippedHead.isEmpty()) {
            codeBlock.add(".addPathSegments($S)", strippedHead);
        }
        for (HttpPathPart httpPathPart : httpPath.getParts()) {
            PathParamInfo poetPathParameter = pathParameters.get(httpPathPart.getPathParameter());
            if (poetPathParameter.irParam().getVariable().isPresent()) {
                VariableId variableId =
                        poetPathParameter.irParam().getVariable().get();
                MethodSpec variableGetter =
                        generatedClientOptions.variableGetters().get(variableId);
                codeBlock.add(
                        "\n.addPathSegment($L)",
                        PoetTypeNameStringifier.stringify(
                                clientOptionsField.name + "." + variableGetter.name + "()",
                                poetPathParameter.poetParam().type));
            } else {
                String paramName = poetPathParameter.poetParam().name;
                if (inlinePathParams
                        && poetPathParameter.irParam().getLocation().equals(PathParameterLocation.ENDPOINT)
                        && httpEndpoint.getSdkRequest().isPresent()) {
                    paramName = httpEndpoint
                                    .getSdkRequest()
                                    .get()
                                    .getRequestParameterName()
                                    .getCamelCase()
                                    .getSafeName()
                            // TODO(agateno): How do we get the getter name from the request body file?
                            + ".get" + paramName.substring(0, 1).toUpperCase(Locale.ROOT) + paramName.substring(1)
                            + "()";
                }
                if (typeNameIsOptional(poetPathParameter.poetParam().type)) {
                    codeBlock.add(";\n");
                    codeBlock
                            .beginControlFlow("if ($L.isPresent())", poetPathParameter.poetParam().name)
                            .addStatement(
                                    "$L.addPathSegment($L)",
                                    httpUrlname,
                                    PoetTypeNameStringifier.stringify(
                                            paramName + ".get()", poetPathParameter.poetParam().type))
                            .endControlFlow();
                    endedWithStatement = true;
                } else {
                    codeBlock.add(
                            "\n.addPathSegment($L)",
                            PoetTypeNameStringifier.stringify(paramName, poetPathParameter.poetParam().type));
                }
            }
            String pathTail = stripLeadingAndTrailingSlash(httpPathPart.getTail());
            if (!pathTail.isEmpty()) {
                codeBlock.add("\n.addPathSegments($S)", pathTail);
            }
        }
        if (addNewLine) {
            codeBlock.add("\n");
        }
        return endedWithStatement;
    }

    private static boolean typeNameIsOptional(TypeName typeName) {
        return typeName instanceof ParameterizedTypeName
                && ((ParameterizedTypeName) typeName).rawType.equals(ClassName.get(Optional.class));
    }

    private static String stripLeadingAndTrailingSlash(String value) {
        String result = value;
        if (result.startsWith("/")) {
            result = result.substring(1);
        }
        if (result.endsWith("/")) {
            result = result.substring(0, result.length() - 1);
        }
        return result;
    }

    private static boolean isTypeNameOptional(TypeName typeName) {
        return typeName instanceof ParameterizedTypeName
                && ((ParameterizedTypeName) typeName).rawType.equals(ClassName.get(Optional.class));
    }

    @Value.Immutable
    @StagedBuilderImmutablesStyle
    public interface GeneratedHttpUrl {
        CodeBlock initialization();

        CodeBlock inlineableBuild();

        static ImmutableGeneratedHttpUrl.InitializationBuildStage builder() {
            return ImmutableGeneratedHttpUrl.builder();
        }
    }

    @Value.Immutable
    @StagedBuilderImmutablesStyle
    public interface PathParamInfo {
        PathParameter irParam();

        ParameterSpec poetParam();

        static ImmutablePathParamInfo.IrParamBuildStage builder() {
            return ImmutablePathParamInfo.builder();
        }
    }
}
