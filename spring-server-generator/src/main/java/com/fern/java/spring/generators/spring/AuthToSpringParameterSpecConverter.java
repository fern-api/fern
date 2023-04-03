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

import com.fern.ir.v12.model.auth.ApiAuth;
import com.fern.ir.v12.model.auth.AuthScheme;
import com.fern.ir.v12.model.auth.HeaderAuthScheme;
import com.fern.ir.v12.model.commons.WithDocs;
import com.fern.ir.v12.model.http.HttpEndpoint;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.output.AbstractGeneratedJavaFile;
import com.fern.java.output.GeneratedAuthFiles;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import org.springframework.web.bind.annotation.RequestHeader;

public final class AuthToSpringParameterSpecConverter {
    private static final String AUTHORIZATION_HEADER_NAME = "Authorization";

    private final AbstractGeneratorContext<?> generatorContext;
    private final GeneratedAuthFiles generatedAuthFiles;

    public AuthToSpringParameterSpecConverter(
            AbstractGeneratorContext<?> generatorContext, GeneratedAuthFiles generatedAuthFiles) {
        this.generatorContext = generatorContext;
        this.generatedAuthFiles = generatedAuthFiles;
    }

    public List<ParameterSpec> getAuthParameters(HttpEndpoint httpEndpoint) {
        ApiAuth apiAuth = generatorContext.getIr().getAuth();
        if (!httpEndpoint.getAuth() || apiAuth.getSchemes().isEmpty()) {
            return Collections.emptyList();
        } else if (apiAuth.getSchemes().size() == 1) {
            AuthScheme authScheme = apiAuth.getSchemes().get(0);
            ParameterSpec parameterSpec =
                    authScheme.visit(new AuthSchemeParameterSpec(generatedAuthFiles, "auth", false));
            return Collections.singletonList(parameterSpec);
        }
        return Collections.emptyList();
    }

    private static final class AuthSchemeParameterSpec implements AuthScheme.Visitor<ParameterSpec> {

        private final AbstractGeneratedJavaFile generatedFile;
        private final boolean isOptional;
        private final String parameterName;

        private AuthSchemeParameterSpec(
                AbstractGeneratedJavaFile generatedFile, String parameterName, boolean isOptional) {
            this.generatedFile = generatedFile;
            this.isOptional = isOptional;
            this.parameterName = parameterName;
        }

        @Override
        public ParameterSpec visitBearer(WithDocs value) {
            return ParameterSpec.builder(getTypeName(), parameterName)
                    .addAnnotation(AnnotationSpec.builder(RequestHeader.class)
                            .addMember("value", "$S", AUTHORIZATION_HEADER_NAME)
                            .build())
                    .build();
        }

        @Override
        public ParameterSpec visitBasic(WithDocs value) {
            return ParameterSpec.builder(getTypeName(), parameterName)
                    .addAnnotation(AnnotationSpec.builder(RequestHeader.class)
                            .addMember("value", "$S", AUTHORIZATION_HEADER_NAME)
                            .build())
                    .build();
        }

        @Override
        public ParameterSpec visitHeader(HeaderAuthScheme value) {
            return ParameterSpec.builder(getTypeName(), parameterName)
                    .addAnnotation(AnnotationSpec.builder(RequestHeader.class)
                            .addMember("value", "$S", value.getHeader())
                            .build())
                    .build();
        }

        @Override
        public ParameterSpec _visitUnknown(Object unknownType) {
            throw new RuntimeException("Encountered unknown AuthScheme: " + unknownType);
        }

        private TypeName getTypeName() {
            if (isOptional) {
                return ParameterizedTypeName.get(ClassName.get(Optional.class), generatedFile.getClassName());
            } else {
                return generatedFile.getClassName();
            }
        }
    }
}
