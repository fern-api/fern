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

package com.fern.java.client;

import com.fern.irV16.model.commons.FernFilepath;
import com.fern.irV16.model.errors.ErrorDeclaration;
import com.fern.irV16.model.http.HttpService;
import com.fern.irV16.model.http.SdkRequestWrapper;
import com.fern.irV16.model.ir.Subpackage;
import com.fern.java.AbstractNonModelPoetClassNameFactory;
import com.squareup.javapoet.ClassName;
import java.util.List;
import java.util.Optional;

public final class ClientPoetClassNameFactory extends AbstractNonModelPoetClassNameFactory {

    public ClientPoetClassNameFactory(List<String> packagePrefixTokens) {
        super(packagePrefixTokens);
    }

    public ClassName getErrorClassName(ErrorDeclaration errorDeclaration) {
        String packageName = getErrorsPackageName(errorDeclaration.getName().getFernFilepath());
        return ClassName.get(
                packageName,
                errorDeclaration.getName().getName().getPascalCase().getSafeName());
    }

    public ClassName getClientClassName(Subpackage subpackage) {
        String packageName = getResourcesPackage(Optional.of(subpackage.getFernFilepath()), Optional.empty());
        return ClassName.get(packageName, getClientName(subpackage.getFernFilepath()));
    }

    public ClassName getRequestWrapperBodyClassName(HttpService httpService, SdkRequestWrapper sdkRequestWrapper) {
        String packageName =
                getResourcesPackage(Optional.of(httpService.getName().getFernFilepath()), Optional.of("requests"));
        return ClassName.get(
                packageName, sdkRequestWrapper.getWrapperName().getPascalCase().getSafeName());
    }

    private static String getClientName(FernFilepath fernFilepath) {
        return fernFilepath
                        .getAllParts()
                        .get(fernFilepath.getAllParts().size() - 1)
                        .getPascalCase()
                        .getUnsafeName() + "Client";
    }
}
