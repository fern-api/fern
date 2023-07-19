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

import com.fern.irV16.model.commons.Availability;
import com.fern.irV16.model.commons.AvailabilityStatus;
import com.fern.irV16.model.commons.Name;
import com.fern.irV16.model.commons.NameAndWireValue;
import com.fern.irV16.model.http.InlinedRequestBody;
import com.fern.irV16.model.types.ObjectProperty;
import java.util.List;
import java.util.stream.Collectors;

public final class InlinedRequestBodyUtils {

    private InlinedRequestBodyUtils() {}

    public static List<ObjectProperty> convertToObjectProperties(InlinedRequestBody inlinedRequestBody) {
        return inlinedRequestBody.getProperties().stream()
                .map(inlinedRequestBodyProperty -> ObjectProperty.builder()
                        .availability(Availability.builder()
                                .status(AvailabilityStatus.GENERAL_AVAILABILITY)
                                .build())
                        .name(NameAndWireValue.builder()
                                .wireValue(inlinedRequestBodyProperty.getName().getWireValue())
                                .name(Name.builder()
                                        .originalName(inlinedRequestBodyProperty
                                                .getName()
                                                .getWireValue())
                                        .camelCase(inlinedRequestBodyProperty
                                                .getName()
                                                .getName()
                                                .getCamelCase())
                                        .pascalCase(inlinedRequestBodyProperty
                                                .getName()
                                                .getName()
                                                .getPascalCase())
                                        .snakeCase(inlinedRequestBodyProperty
                                                .getName()
                                                .getName()
                                                .getSnakeCase())
                                        .screamingSnakeCase(inlinedRequestBodyProperty
                                                .getName()
                                                .getName()
                                                .getScreamingSnakeCase())
                                        .build())
                                .build())
                        .valueType(inlinedRequestBodyProperty.getValueType())
                        .docs(inlinedRequestBodyProperty.getDocs())
                        .build())
                .collect(Collectors.toList());
    }
}
