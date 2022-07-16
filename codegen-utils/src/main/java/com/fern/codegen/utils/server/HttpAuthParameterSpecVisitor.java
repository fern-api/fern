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
package com.fern.codegen.utils.server;

import com.fern.java.auth.BasicAuthHeader;
import com.fern.java.auth.BearerAuthHeader;
import com.fern.types.services.HttpAuth;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ParameterSpec;
import java.util.Optional;
import javax.ws.rs.HeaderParam;

public final class HttpAuthParameterSpecVisitor implements HttpAuth.Visitor<Optional<ParameterSpec>> {

    public static final HttpAuthParameterSpecVisitor INSTANCE = new HttpAuthParameterSpecVisitor();

    private static final String AUTHORIZATION_HEADER_NAME = "Authorization";

    @Override
    public Optional<ParameterSpec> visitBASIC() {
        return Optional.of(ParameterSpec.builder(BasicAuthHeader.class, "authHeader")
                .addAnnotation(AnnotationSpec.builder(HeaderParam.class)
                        .addMember("value", "$S", AUTHORIZATION_HEADER_NAME)
                        .build())
                .build());
    }

    @Override
    public Optional<ParameterSpec> visitBEARER() {
        return Optional.of(ParameterSpec.builder(BearerAuthHeader.class, "authHeader")
                .addAnnotation(AnnotationSpec.builder(HeaderParam.class)
                        .addMember("value", "$S", AUTHORIZATION_HEADER_NAME)
                        .build())
                .build());
    }

    @Override
    public Optional<ParameterSpec> visitNONE() {
        return Optional.empty();
    }

    @Override
    public Optional<ParameterSpec> visitUnknown(String _unknownType) {
        return Optional.empty();
    }
}
