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

import com.squareup.javapoet.MethodSpec;
import java.util.Optional;

public final class DefaultHttpEndpointMethodSpecs implements HttpEndpointMethodSpecs {

    private final MethodSpec nonRequestOptionsMethodSpec;
    private final MethodSpec requestOptionsMethodSpec;
    private final MethodSpec noRequestBodyMethodSpec;
    private final MethodSpec byteArrayMethodSpec;
    private final MethodSpec nonRequestOptionsByteArrayMethodSpec;

    public DefaultHttpEndpointMethodSpecs(
            MethodSpec requestOptionsMethodSpec,
            MethodSpec nonRequestOptionsMethodSpec,
            MethodSpec noRequestBodyMethodSpec,
            MethodSpec byteArrayMethodSpec,
            MethodSpec nonRequestOptionsByteArrayMethodSpec) {
        this.nonRequestOptionsMethodSpec = nonRequestOptionsMethodSpec;
        this.requestOptionsMethodSpec = requestOptionsMethodSpec;
        this.noRequestBodyMethodSpec = noRequestBodyMethodSpec;
        this.byteArrayMethodSpec = byteArrayMethodSpec;
        this.nonRequestOptionsByteArrayMethodSpec = nonRequestOptionsByteArrayMethodSpec;
    }

    @Override
    public MethodSpec getNonRequestOptionsMethodSpec() {
        return nonRequestOptionsMethodSpec;
    }

    @Override
    public MethodSpec getRequestOptionsMethodSpec() {
        return requestOptionsMethodSpec;
    }

    @Override
    public Optional<MethodSpec> getNoRequestBodyMethodSpec() {
        return Optional.ofNullable(noRequestBodyMethodSpec);
    }

    @Override
    public Optional<MethodSpec> getByteArrayMethodSpec() {
        return Optional.ofNullable(byteArrayMethodSpec);
    }

    @Override
    public Optional<MethodSpec> getNonRequestOptionsByteArrayMethodSpec() {
        return Optional.ofNullable(nonRequestOptionsByteArrayMethodSpec);
    }
}
