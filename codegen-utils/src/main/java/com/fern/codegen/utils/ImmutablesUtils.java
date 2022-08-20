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

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fern.types.WireStringWithAllCasings;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeName;
import javax.lang.model.element.Modifier;
import org.apache.commons.lang3.StringUtils;

public final class ImmutablesUtils {

    private static final String IMMUTABLE_PREFIX = "Immutable";

    public ImmutablesUtils() {}

    public MethodSpec getKeyWordCompatibleImmutablesPropertyMethod(
            WireStringWithAllCasings property, TypeName returnType) {
        String prefix = "";
        if (KeyWordUtils.isReserved(property.camelCase())) {
            prefix = "_";
        }
        return MethodSpec.methodBuilder(prefix + property.camelCase())
                .addAnnotation(AnnotationSpec.builder(JsonProperty.class)
                        .addMember("value", "$S", property.wireValue())
                        .build())
                .returns(returnType)
                .addModifiers(Modifier.PUBLIC, Modifier.ABSTRACT)
                .build();
    }

    public ClassName getImmutablesClassName(ClassName interfaceClassName) {
        return ClassName.get(
                interfaceClassName.packageName(),
                IMMUTABLE_PREFIX + StringUtils.capitalize(interfaceClassName.simpleName()));
    }
}
