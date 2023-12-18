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
package com.fern.java.utils;

import java.util.Set;

public final class KeyWordUtils {

    private static final Set<String> RESERVED_WORDS = Set.of(
            "enum",
            "extends",
            "package",
            "void",
            "object",
            "short",
            "class",
            "abstract",
            "return",
            "import",
            "for",
            "assert",
            "switch");

    private static final Set<String> RESERVED_METHOD_NAMES = Set.of("getClass");

    private KeyWordUtils() {}

    public static String getKeyWordCompatibleMethodName(String funcName) {
        if (isReservedFunctionName(funcName)) {
            return funcName + "_";
        }
        return funcName;
    }

    public static String getKeyWordCompatibleName(String name) {
        if (isReserved(name.toLowerCase())) {
            return "_" + name;
        }
        return name;
    }

    public static boolean isReserved(String value) {
        return RESERVED_WORDS.contains(value.toLowerCase());
    }

    public static boolean isReservedFunctionName(String value) {
        return RESERVED_METHOD_NAMES.contains(value);
    }
}
