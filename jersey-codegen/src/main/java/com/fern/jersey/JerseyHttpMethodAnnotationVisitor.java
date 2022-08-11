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
package com.fern.jersey;

import com.fern.types.services.HttpMethod;
import com.squareup.javapoet.AnnotationSpec;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.PATCH;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;

public final class JerseyHttpMethodAnnotationVisitor implements HttpMethod.Visitor<AnnotationSpec> {

    public static final JerseyHttpMethodAnnotationVisitor INSTANCE = new JerseyHttpMethodAnnotationVisitor();

    @Override
    public AnnotationSpec visitGet() {
        return AnnotationSpec.builder(GET.class).build();
    }

    @Override
    public AnnotationSpec visitPost() {
        return AnnotationSpec.builder(POST.class).build();
    }

    @Override
    public AnnotationSpec visitPut() {
        return AnnotationSpec.builder(PUT.class).build();
    }

    @Override
    public AnnotationSpec visitDelete() {
        return AnnotationSpec.builder(DELETE.class).build();
    }

    @Override
    public AnnotationSpec visitPatch() {
        return AnnotationSpec.builder(PATCH.class).build();
    }

    @Override
    public AnnotationSpec visitUnknown(String unknownType) {
        throw new RuntimeException("Encountered unknown HttpMethod: " + unknownType);
    }
}
