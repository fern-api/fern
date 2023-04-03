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

import com.fern.ir.v12.model.commons.FernFilepath;
import com.fern.ir.v12.model.errors.ErrorDeclaration;
import com.fern.ir.v12.model.http.HttpService;
import com.fern.ir.v12.model.http.SdkRequestWrapper;
import com.fern.ir.v12.model.ir.IntermediateRepresentation;
import com.fern.ir.v12.model.ir.Subpackage;
import com.fern.java.AbstractNonModelPoetClassNameFactory;
import com.fern.java.AbstractPoetClassNameFactory;
import com.squareup.javapoet.ClassName;
import java.util.Optional;

public final class ClientPoetClassNameFactory extends AbstractNonModelPoetClassNameFactory {

    public ClientPoetClassNameFactory(IntermediateRepresentation ir, String organization) {
        super(AbstractPoetClassNameFactory.getPackagePrefixWithOrgAndApiName(ir, organization));
    }

    public ClassName getErrorClassName(ErrorDeclaration errorDeclaration) {
        String packageName = getErrorsPackageName(errorDeclaration.getName().getFernFilepath());
        return ClassName.get(
                packageName,
                errorDeclaration.getName().getName().getPascalCase().getSafeName());
    }

    public ClassName getClientInterfaceClassName(Subpackage subpackage) {
        String packageName = getResourcesPackage(Optional.of(subpackage.getFernFilepath()), Optional.empty());
        return ClassName.get(packageName, getClientName(subpackage.getFernFilepath()));
    }

    public ClassName getClientImplClassName(Subpackage subpackage) {
        String packageName = getResourcesPackage(Optional.of(subpackage.getFernFilepath()), Optional.empty());
        return ClassName.get(packageName, getClientImplName(subpackage.getFernFilepath()));
    }

    public ClassName getRequestWrapperBodyClassName(HttpService httpService, SdkRequestWrapper sdkRequestWrapper) {
        String packageName =
                getResourcesPackage(Optional.of(httpService.getName().getFernFilepath()), Optional.of("requests"));
        return ClassName.get(
                packageName, sdkRequestWrapper.getWrapperName().getPascalCase().getSafeName());
    }

    private static String getClientImplName(FernFilepath fernFilepath) {
        return getClientName(fernFilepath) + "Impl";
    }

    private static String getClientName(FernFilepath fernFilepath) {
        return fernFilepath
                        .getAllParts()
                        .get(fernFilepath.getAllParts().size() - 1)
                        .getPascalCase()
                        .getUnsafeName() + "Client";
    }
}
