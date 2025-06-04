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

import com.fern.ir.model.http.HttpEndpoint;
import com.fern.ir.model.http.HttpMethod;
import com.fern.java.utils.HttpPathUtils;
import com.squareup.javapoet.AnnotationSpec;
import java.util.Optional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;

public final class SpringHttpMethodToAnnotationSpec implements HttpMethod.Visitor<AnnotationSpec> {

    private final String path;
    private final Optional<String> consumes;
    private final Optional<String> produces;

    public SpringHttpMethodToAnnotationSpec(HttpEndpoint httpEndpoint) {
        this.path = HttpPathUtils.getPathWithCurlyBracedPathParams(httpEndpoint.getPath());
        this.consumes = httpEndpoint.getRequestBody().map(_body -> "application/json");
        this.produces = httpEndpoint.getResponse().map(_body -> "application/json");
    }

    @Override
    public AnnotationSpec visitGet() {
        return build(AnnotationSpec.builder(GetMapping.class).addMember("value", "$S", path));
    }

    @Override
    public AnnotationSpec visitPost() {
        return build(AnnotationSpec.builder(PostMapping.class).addMember("value", "$S", path));
    }

    @Override
    public AnnotationSpec visitPut() {
        return build(AnnotationSpec.builder(PutMapping.class).addMember("value", "$S", path));
    }

    @Override
    public AnnotationSpec visitDelete() {
        return build(AnnotationSpec.builder(DeleteMapping.class).addMember("value", "$S", path));
    }

    @Override
    public AnnotationSpec visitPatch() {
        return build(AnnotationSpec.builder(PatchMapping.class).addMember("value", "$S", path));
    }

    @Override
    public AnnotationSpec visitHead() {
        return build(AnnotationSpec.builder(GetMapping.class).addMember("value", "$S", path));
    }

    @Override
    public AnnotationSpec visitUnknown(String unknownType) {
        throw new RuntimeException("Encountered unknown HttpMethod: " + unknownType);
    }

    private AnnotationSpec build(AnnotationSpec.Builder annotationSpecBuilder) {
        if (produces.isPresent()) {
            annotationSpecBuilder.addMember("produces", "$S", produces.get());
        }
        if (consumes.isPresent()) {
            annotationSpecBuilder.addMember("consumes", "$S", consumes.get());
        }
        return annotationSpecBuilder.build();
    }
}
