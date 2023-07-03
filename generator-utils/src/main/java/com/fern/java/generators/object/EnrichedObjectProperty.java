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

package com.fern.java.generators.object;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fern.irV12.model.commons.Name;
import com.fern.irV12.model.types.ContainerType;
import com.fern.irV12.model.types.Literal;
import com.fern.irV12.model.types.ObjectProperty;
import com.fern.java.immutables.StagedBuilderImmutablesStyle;
import com.fern.java.utils.JavaDocUtils;
import com.fern.java.utils.KeyWordUtils;
import com.squareup.javapoet.AnnotationSpec;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeName;
import java.util.Optional;
import javax.lang.model.element.Modifier;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderImmutablesStyle
public interface EnrichedObjectProperty {

    Optional<String> wireKey();

    String camelCaseKey();

    String pascalCaseKey();

    TypeName poetTypeName();

    boolean fromInterface();

    Optional<String> docs();

    Optional<String> literalValue();

    @Value.Lazy
    default Optional<FieldSpec> fieldSpec() {
        if (literalValue().isPresent()) {
            return Optional.empty();
        }
        return Optional.of(FieldSpec.builder(
                        poetTypeName(),
                        KeyWordUtils.getKeyWordCompatibleName(camelCaseKey()),
                        Modifier.PRIVATE,
                        Modifier.FINAL)
                .build());
    }

    @Value.Lazy
    default MethodSpec getterProperty() {
        MethodSpec.Builder getterBuilder = MethodSpec.methodBuilder("get" + pascalCaseKey())
                .addModifiers(Modifier.PUBLIC)
                .returns(poetTypeName());
        if (literalValue().isPresent()) {
            getterBuilder.addStatement("return $S", literalValue().get());
        } else {
            getterBuilder.addStatement("return $L", fieldSpec().get().name);
        }
        if (wireKey().isPresent()) {
            getterBuilder.addAnnotation(AnnotationSpec.builder(JsonProperty.class)
                    .addMember("value", "$S", wireKey().get())
                    .build());
        }
        if (fromInterface()) {
            getterBuilder.addAnnotation(Override.class);
        }
        if (docs().isPresent()) {
            getterBuilder.addJavadoc(JavaDocUtils.getReturnDocs(docs().get()));
        }
        return getterBuilder.build();
    }

    static ImmutableEnrichedObjectProperty.CamelCaseKeyBuildStage builder() {
        return ImmutableEnrichedObjectProperty.builder();
    }

    static EnrichedObjectProperty of(ObjectProperty objectProperty, boolean fromInterface, TypeName poetTypeName) {
        Name name = objectProperty.getName().getName();
        Optional<String> maybeLiteral = objectProperty
                .getValueType()
                .getContainer()
                .flatMap(ContainerType::getLiteral)
                .flatMap(Literal::getString);
        return EnrichedObjectProperty.builder()
                .camelCaseKey(name.getCamelCase().getSafeName())
                .pascalCaseKey(name.getPascalCase().getSafeName())
                .poetTypeName(poetTypeName)
                .fromInterface(fromInterface)
                .wireKey(objectProperty.getName().getWireValue())
                .docs(objectProperty.getDocs())
                .literalValue(maybeLiteral)
                .build();
    }
}
