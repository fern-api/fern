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

package com.fern.jersey.client;

import com.fern.codegen.GeneratedEndpointModel;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.utils.server.HttpAuthParameterSpecVisitor;
import com.fern.jersey.JerseyServiceGeneratorUtils;
import com.fern.types.services.EndpointId;
import com.fern.types.services.HttpEndpoint;
import com.fern.types.services.HttpService;
import com.squareup.javapoet.ParameterSpec;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import javax.ws.rs.HeaderParam;

public final class HttpEndpointArgumentUtils {

    private static final HttpAuthParameterSpecVisitor JERSEY_AUTH_PARAMATER_SPEC_VISITOR =
            new HttpAuthParameterSpecVisitor(HeaderParam.class);

    private HttpEndpointArgumentUtils() {}

    public static List<ParameterSpec> getHttpEndpointArguments(
            HttpService httpService,
            HttpEndpoint httpEndpoint,
            GeneratorContext generatorContext,
            Map<EndpointId, GeneratedEndpointModel> generatedEndpointModels) {
        JerseyServiceGeneratorUtils jerseyServiceGeneratorUtils = new JerseyServiceGeneratorUtils(generatorContext);
        List<ParameterSpec> parameters = new ArrayList<>();

        httpEndpoint.auth().visit(JERSEY_AUTH_PARAMATER_SPEC_VISITOR).ifPresent(parameters::add);

        httpService.headers().stream()
                .map(jerseyServiceGeneratorUtils::getHeaderParameterSpec)
                .forEach(parameters::add);

        httpEndpoint.headers().stream()
                .map(jerseyServiceGeneratorUtils::getHeaderParameterSpec)
                .forEach(parameters::add);
        httpEndpoint.pathParameters().stream()
                .map(jerseyServiceGeneratorUtils::getPathParameterSpec)
                .forEach(parameters::add);
        httpEndpoint.queryParameters().stream()
                .map(jerseyServiceGeneratorUtils::getQueryParameterSpec)
                .forEach(parameters::add);

        GeneratedEndpointModel generatedEndpointModel = generatedEndpointModels.get(httpEndpoint.endpointId());
        jerseyServiceGeneratorUtils
                .getPayloadTypeName(generatedEndpointModel.generatedHttpRequest())
                .ifPresent(typeName -> {
                    parameters.add(ParameterSpec.builder(typeName, "body").build());
                });

        return parameters;
    }
}
