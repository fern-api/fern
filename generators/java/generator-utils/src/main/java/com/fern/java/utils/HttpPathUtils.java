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

import com.fern.ir.model.http.HttpPath;
import com.fern.ir.model.http.HttpPathPart;

public final class HttpPathUtils {

    private HttpPathUtils() {}

    public static String getPathWithCurlyBracedPathParams(HttpPath httpPath) {
        String result = httpPath.getHead();
        for (HttpPathPart httpPathPart : httpPath.getParts()) {
            result += "{" + httpPathPart.getPathParameter() + "}" + httpPathPart.getTail();
        }
        return result;
    }
}
