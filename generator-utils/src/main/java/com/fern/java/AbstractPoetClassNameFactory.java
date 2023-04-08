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

package com.fern.java;

import com.fern.ir.v12.model.ir.IntermediateRepresentation;
import com.fern.ir.v12.model.types.DeclaredTypeName;
import com.squareup.javapoet.ClassName;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public abstract class AbstractPoetClassNameFactory {

    private static final String OBJECT_MAPPERS_CLASS_SIMPLE_NAME = "ObjectMappers";

    private final List<String> packagePrefixTokens;

    public AbstractPoetClassNameFactory(List<String> packagePrefixTokens) {
        this.packagePrefixTokens = packagePrefixTokens;
    }

    public abstract ClassName getTypeClassName(DeclaredTypeName declaredTypeName);

    public abstract ClassName getInterfaceClassName(DeclaredTypeName declaredTypeName);

    public final ClassName getObjectMapperClassName() {
        return getCoreClassName(OBJECT_MAPPERS_CLASS_SIMPLE_NAME);
    }

    public final ClassName getCoreClassName(String className) {
        return ClassName.get(getCorePackage(), className);
    }

    public final ClassName getRootClassName(String className) {
        return ClassName.get(getRootPackage(), className);
    }

    public final String getCorePackage() {
        List<String> tokens = new ArrayList<>(packagePrefixTokens);
        tokens.add("core");
        return String.join(".", tokens);
    }

    public final String getRootPackage() {
        List<String> tokens = new ArrayList<>(packagePrefixTokens);
        return String.join(".", tokens);
    }

    public final List<String> getPackagePrefixTokens() {
        return packagePrefixTokens;
    }

    public static List<String> splitOnNonAlphaNumericChar(String value) {
        return Arrays.asList(value.split("[^a-zA-Z0-9]"));
    }

    public static List<String> getPackagePrefixWithOrgAndApiName(IntermediateRepresentation ir, String organization) {
        List<String> prefix = new ArrayList<>();
        prefix.add("com");
        prefix.addAll(splitOnNonAlphaNumericChar(organization));
        prefix.addAll(splitOnNonAlphaNumericChar(ir.getApiName().getCamelCase().getSafeName()));
        return prefix;
    }
}
