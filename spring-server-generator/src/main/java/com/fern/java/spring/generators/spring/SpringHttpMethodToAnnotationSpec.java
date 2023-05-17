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

import com.fern.irV12.model.http.HttpEndpoint;
import com.fern.irV12.model.http.HttpMethod;
import com.fern.java.utils.HttpPathUtils;
import com.squareup.javapoet.AnnotationSpec;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;

public final class SpringHttpMethodToAnnotationSpec implements HttpMethod.Visitor<AnnotationSpec> {

    private final String path;

    public SpringHttpMethodToAnnotationSpec(HttpEndpoint httpEndpoint) {
        this.path = HttpPathUtils.getPathWithCurlyBracedPathParams(httpEndpoint.getPath());
    }

    @Override
    public AnnotationSpec visitGet() {
        return AnnotationSpec.builder(GetMapping.class)
                .addMember("value", "$S", path)
                .build();
    }

    @Override
    public AnnotationSpec visitPost() {
        return AnnotationSpec.builder(PostMapping.class)
                .addMember("value", "$S", path)
                .build();
    }

    @Override
    public AnnotationSpec visitPut() {
        return AnnotationSpec.builder(PutMapping.class)
                .addMember("value", "$S", path)
                .build();
    }

    @Override
    public AnnotationSpec visitDelete() {
        return AnnotationSpec.builder(DeleteMapping.class)
                .addMember("value", "$S", path)
                .build();
    }

    @Override
    public AnnotationSpec visitPatch() {
        return AnnotationSpec.builder(PatchMapping.class)
                .addMember("value", "$S", path)
                .build();
    }

    @Override
    public AnnotationSpec visitUnknown(String unknownType) {
        throw new RuntimeException("Encountered unknown HttpMethod: " + unknownType);
    }
}
