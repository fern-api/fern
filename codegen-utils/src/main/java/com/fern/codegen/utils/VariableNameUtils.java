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

import com.fern.types.services.HttpHeader;
import java.util.List;
import org.apache.commons.text.CaseUtils;

public final class VariableNameUtils {

    private static final List<String> COMMON_REMOVABLE_HTTP_HEADERS = List.of("X-", "x-");

    private VariableNameUtils() {}

    public static String getVariableNameFromHeader(HttpHeader httpHeader) {
        String unprefixedHeader = httpHeader.name().originalValue();
        for (String prefix : COMMON_REMOVABLE_HTTP_HEADERS) {
            if (unprefixedHeader.startsWith(prefix)) {
                unprefixedHeader = unprefixedHeader.substring(prefix.length());
            }
        }
        return CaseUtils.toCamelCase(unprefixedHeader, false, '_', ' ', '-');
    }
}
