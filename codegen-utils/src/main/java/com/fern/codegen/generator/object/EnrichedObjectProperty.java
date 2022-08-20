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

package com.fern.codegen.generator.object;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fern.codegen.utils.ClassNameUtils;
import com.fern.codegen.utils.KeyWordUtils;
import com.fern.java.immutables.StagedBuilderImmutablesStyle;
import com.fern.types.ObjectProperty;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeName;
import javax.lang.model.element.Modifier;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderImmutablesStyle
public interface EnrichedObjectProperty {

    String wireKey();

    String camelCaseKey();

    String pascalCaseKey();

    TypeName poetTypeName();

    boolean fromInterface();

    @Value.Lazy
    default FieldSpec fieldSpec() {
        return FieldSpec.builder(
                        poetTypeName(),
                        KeyWordUtils.getKeyWordCompatibleName(camelCaseKey()),
                        Modifier.PRIVATE,
                        Modifier.FINAL)
                .build();
    }

    @Value.Lazy
    default MethodSpec getterProperty() {
        MethodSpec.Builder getterBuilder = MethodSpec.methodBuilder("get" + pascalCaseKey())
                .addAnnotation(AnnotationSpec.builder(JsonProperty.class)
                        .addMember("value", "$S", wireKey())
                        .build())
                .addModifiers(Modifier.PUBLIC)
                .returns(fieldSpec().type)
                .addStatement("return $L", fieldSpec().name);
        if (fromInterface()) {
            getterBuilder.addAnnotation(Override.class);
        }
        return getterBuilder.build();
    }

    private static ImmutableEnrichedObjectProperty.WireKeyBuildStage builder() {
        return ImmutableEnrichedObjectProperty.builder();
    }

    static EnrichedObjectProperty of(
            ObjectProperty objectProperty, boolean fromInterface, ClassNameUtils classNameUtils) {
        TypeName poetTypeName = classNameUtils.getTypeNameFromTypeReference(true, objectProperty.valueType());
        return EnrichedObjectProperty.builder()
                .wireKey(objectProperty.name().wireValue())
                .camelCaseKey(objectProperty.name().camelCase())
                .pascalCaseKey(objectProperty.name().pascalCase())
                .poetTypeName(poetTypeName)
                .fromInterface(fromInterface)
                .build();
    }
}
