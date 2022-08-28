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
import com.fern.codegen.GeneratedFile;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.utils.HttpAuthParameterSpecsUtils;
import com.fern.ir.model.auth.AuthScheme;
import com.fern.ir.model.services.http.HttpEndpoint;
import com.fern.ir.model.services.http.HttpEndpointId;
import com.fern.ir.model.services.http.HttpService;
import com.fern.jersey.JerseyServiceGeneratorUtils;
import com.squareup.javapoet.ParameterSpec;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import javax.ws.rs.HeaderParam;

public final class HttpEndpointArgumentUtils {

    private HttpEndpointArgumentUtils() {}

    public static List<ParameterSpec> getHttpEndpointArguments(
            HttpService httpService,
            HttpEndpoint httpEndpoint,
            GeneratorContext generatorContext,
            Map<HttpEndpointId, GeneratedEndpointModel> generatedEndpointModels,
            Map<AuthScheme, GeneratedFile> generatedAuthSchemes) {
        JerseyServiceGeneratorUtils jerseyServiceGeneratorUtils = new JerseyServiceGeneratorUtils(generatorContext);
        List<ParameterSpec> parameters = new ArrayList<>();

        HttpAuthParameterSpecsUtils httpAuthParameterSpecsUtils =
                new HttpAuthParameterSpecsUtils(HeaderParam.class, generatorContext, generatedAuthSchemes);
        parameters.addAll(httpAuthParameterSpecsUtils.getAuthParameters(httpEndpoint));

        httpService.getHeaders().stream()
                .map(jerseyServiceGeneratorUtils::getHeaderParameterSpec)
                .forEach(parameters::add);

        httpEndpoint.getHeaders().stream()
                .map(jerseyServiceGeneratorUtils::getHeaderParameterSpec)
                .forEach(parameters::add);
        httpEndpoint.getPathParameters().stream()
                .map(jerseyServiceGeneratorUtils::getPathParameterSpec)
                .forEach(parameters::add);
        httpEndpoint.getQueryParameters().stream()
                .map(jerseyServiceGeneratorUtils::getQueryParameterSpec)
                .forEach(parameters::add);

        GeneratedEndpointModel generatedEndpointModel = generatedEndpointModels.get(httpEndpoint.getId());
        jerseyServiceGeneratorUtils
                .getPayloadTypeName(generatedEndpointModel.generatedHttpRequest())
                .ifPresent(typeName -> {
                    parameters.add(ParameterSpec.builder(typeName, "body").build());
                });

        return parameters;
    }
}
