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

package com.fern.codegen.utils;

import com.fern.codegen.GeneratedFile;
import com.fern.codegen.GeneratorContext;
import com.fern.ir.model.auth.ApiAuth;
import com.fern.ir.model.auth.AuthScheme;
import com.fern.ir.model.auth.AuthSchemesRequirement;
import com.fern.ir.model.commons.WithDocs;
import com.fern.ir.model.services.http.HttpEndpoint;
import com.fern.ir.model.services.http.HttpHeader;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

public final class HttpAuthParameterSpecsUtils {

    private static final String AUTHORIZATION_HEADER_NAME = "Authorization";

    private final Class<?> headerAnnotationClazz;
    private final GeneratorContext generatorContext;
    private final Map<AuthScheme, GeneratedFile> generatedAuthSchemes;

    public HttpAuthParameterSpecsUtils(
            Class<?> headerAnnotationClazz,
            GeneratorContext generatorContext,
            Map<AuthScheme, GeneratedFile> generatedAuthSchemes) {
        this.headerAnnotationClazz = headerAnnotationClazz;
        this.generatorContext = generatorContext;
        this.generatedAuthSchemes = generatedAuthSchemes;
    }

    public List<ParameterSpec> getAuthParameters(HttpEndpoint httpEndpoint) {
        ApiAuth apiAuth = generatorContext.getApiAuth();
        if (!httpEndpoint.getAuth() || apiAuth.getSchemes().isEmpty()) {
            return Collections.emptyList();
        }
        if (apiAuth.getSchemes().size() == 1) {
            AuthScheme authScheme = apiAuth.getSchemes().get(0);
            ParameterSpec parameterSpec = authScheme.visit(new AuthSchemeParameterSpec(
                    generatedAuthSchemes.get(authScheme),
                    AuthSchemeUtils.getAuthSchemeCamelCaseName(authScheme),
                    false));
            return Collections.singletonList(parameterSpec);
        } else if (apiAuth.getRequirement().equals(AuthSchemesRequirement.ANY)) {
            return apiAuth.getSchemes().stream()
                    .map(authScheme -> authScheme.visit(new AuthSchemeParameterSpec(
                            generatedAuthSchemes.get(authScheme),
                            AuthSchemeUtils.getAuthSchemeCamelCaseName(authScheme),
                            true)))
                    .collect(Collectors.toList());
        } else if (apiAuth.getRequirement().equals(AuthSchemesRequirement.ALL)) {
            return apiAuth.getSchemes().stream()
                    .map(authScheme -> authScheme.visit(new AuthSchemeParameterSpec(
                            generatedAuthSchemes.get(authScheme),
                            AuthSchemeUtils.getAuthSchemeCamelCaseName(authScheme),
                            false)))
                    .collect(Collectors.toList());
        }
        throw new RuntimeException("Didn't handle auth for endpoint: " + httpEndpoint);
    }

    private final class AuthSchemeParameterSpec implements AuthScheme.Visitor<ParameterSpec> {

        private final GeneratedFile generatedFile;
        private final boolean isOptional;
        private final String parameterName;

        private AuthSchemeParameterSpec(GeneratedFile generatedFile, String parameterName, boolean isOptional) {
            this.generatedFile = generatedFile;
            this.isOptional = isOptional;
            this.parameterName = parameterName;
        }

        @Override
        public ParameterSpec visitBearer(WithDocs value) {
            return ParameterSpec.builder(getTypeName(), parameterName)
                    .addAnnotation(AnnotationSpec.builder(headerAnnotationClazz)
                            .addMember("value", "$S", AUTHORIZATION_HEADER_NAME)
                            .build())
                    .build();
        }

        @Override
        public ParameterSpec visitBasic(WithDocs value) {
            return ParameterSpec.builder(getTypeName(), parameterName)
                    .addAnnotation(AnnotationSpec.builder(headerAnnotationClazz)
                            .addMember("value", "$S", AUTHORIZATION_HEADER_NAME)
                            .build())
                    .build();
        }

        @Override
        public ParameterSpec visitHeader(HttpHeader value) {
            return ParameterSpec.builder(getTypeName(), parameterName)
                    .addAnnotation(AnnotationSpec.builder(headerAnnotationClazz)
                            .addMember("value", "$S", value.getName().getWireValue())
                            .build())
                    .build();
        }

        @Override
        public ParameterSpec _visitUnknown(Object unknown) {
            throw new RuntimeException("Encountered unknown AuthScheme: " + unknown);
        }

        private TypeName getTypeName() {
            if (isOptional) {
                return ParameterizedTypeName.get(ClassName.get(Optional.class), generatedFile.className());
            } else {
                return generatedFile.className();
            }
        }
    }
}
