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

import com.fern.ir.model.commons.FernFilepath;
import com.fern.ir.model.commons.Name;
import com.fern.ir.model.commons.SafeAndUnsafeString;
import com.fern.ir.model.types.DeclaredTypeName;
import com.fern.java.utils.KeyWordUtils;
import com.squareup.javapoet.ClassName;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public abstract class AbstractModelPoetClassNameFactory extends AbstractPoetClassNameFactory {

    public AbstractModelPoetClassNameFactory(
            List<String> packagePrefixTokens, ICustomConfig.PackageLayout packageLayout) {
        super(packagePrefixTokens, packageLayout);
    }

    @Override
    public final ClassName getTypeClassName(DeclaredTypeName declaredTypeName) {
        String packageName = getTypesPackageName(declaredTypeName.getFernFilepath());
        return ClassName.get(
                packageName, declaredTypeName.getName().getPascalCase().getSafeName());
    }

    @Override
    public final ClassName getInterfaceClassName(DeclaredTypeName declaredTypeName) {
        String packageName = getTypesPackageName(declaredTypeName.getFernFilepath());
        return ClassName.get(
                packageName, "I" + declaredTypeName.getName().getPascalCase().getSafeName());
    }

    protected final String getTypesPackageName(FernFilepath fernFilepath) {
        List<String> tokens = new ArrayList<>(getPackagePrefixTokens());
        switch (packageLayout) {
            case FLAT:
                // NOTE: We're making it camel-case here on purpose: snake-case is used in the NESTED case for
                //  historical reasons, but we should unify on this method going forward.
                tokens.addAll(fernFilepath.getPackagePath().stream()
                        .map(Name::getCamelCase)
                        .map(SafeAndUnsafeString::getSafeName)
                        .map(String::toLowerCase)
                        .map(KeyWordUtils::getKeyWordCompatibleName)
                        .collect(Collectors.toList()));
                break;
            case NESTED:
            default:
                tokens.add("model");
                tokens.addAll(fernFilepath.getAllParts().stream()
                        .map(Name::getSnakeCase)
                        .map(SafeAndUnsafeString::getSafeName)
                        .flatMap(snakeCase -> splitOnNonAlphaNumericChar(snakeCase).stream())
                        .map(KeyWordUtils::getKeyWordCompatibleName)
                        .collect(Collectors.toList()));
        }
        return String.join(".", tokens);
    }
}
