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

import com.fern.ir.v9.model.auth.AuthScheme;
import com.fern.ir.v9.model.commons.WithDocs;
import com.fern.ir.v9.model.http.HttpHeader;
import com.squareup.javapoet.FieldSpec;

public final class ClientAuthFieldSpec {

    private final AuthScheme authScheme;
    private final FieldSpec authField;

    public ClientAuthFieldSpec(AuthScheme authScheme, FieldSpec authField) {
        this.authScheme = authScheme;
        this.authField = authField;
    }

    public AuthScheme getAuthScheme() {
        return authScheme;
    }

    public FieldSpec getAuthField() {
        return authField;
    }

    public String getHeaderKey() {
        return authScheme.visit(new AuthScheme.Visitor<String>() {

            @Override
            public String visitBearer(WithDocs bearer) {
                return "Authorization";
            }

            @Override
            public String visitBasic(WithDocs basic) {
                return "Authorization";
            }

            @Override
            public String visitHeader(HttpHeader header) {
                return header.getName().getWireValue();
            }

            @Override
            public String _visitUnknown(Object unknownType) {
                throw new RuntimeException("Encountered unknown auth" + unknownType);
            }
        });
    }
}
