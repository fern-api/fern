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

package com.fern.java;

import com.fern.ir.model.commons.Name;
import com.fern.ir.model.commons.NameAndWireValue;
import com.fern.ir.model.commons.NameAndWireValueOrString;
import com.fern.ir.model.commons.NameOrString;
import com.fern.ir.model.http.FileUploadRequest;
import com.fern.ir.model.http.FileUploadRequestProperty;
import com.fern.ir.model.http.InlinedRequestBody;
import com.fern.ir.model.types.ObjectProperty;
import com.fern.ir.model.types.TypeReference;
import com.fern.java.utils.NameUtils;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

public final class RequestBodyUtils {

    private RequestBodyUtils() {}

    public static List<ObjectProperty> convertToObjectProperties(InlinedRequestBody inlinedRequestBody) {
        return inlinedRequestBody.getProperties().stream()
                .map(prop -> toObjectProperty(prop.getName(), prop.getValueType(), prop.getDocs()))
                .collect(Collectors.toList());
    }

    public static List<ObjectProperty> convertToObjectProperties(FileUploadRequest uploadRequest) {
        return uploadRequest.getProperties().stream()
                .map(FileUploadRequestProperty::getBodyProperty)
                .flatMap(Optional::stream)
                .map(prop -> toObjectProperty(prop.getName(), prop.getValueType(), prop.getDocs()))
                .collect(Collectors.toList());
    }

    private static ObjectProperty toObjectProperty(
            NameAndWireValueOrString propertyName, TypeReference valueType, Optional<String> docs) {
        String wireValue = NameUtils.getWireValue(propertyName);
        Name name = NameUtils.getName(propertyName);
        return ObjectProperty.builder()
                .name(NameAndWireValueOrString.of(NameAndWireValue.builder()
                        .wireValue(wireValue)
                        .name(NameOrString.of(Name.builder()
                                .originalName(wireValue)
                                .camelCase(name.getCamelCase())
                                .pascalCase(name.getPascalCase())
                                .snakeCase(name.getSnakeCase())
                                .screamingSnakeCase(name.getScreamingSnakeCase())
                                .build()))
                        .build()))
                .valueType(valueType)
                .docs(docs)
                .build();
    }
}
