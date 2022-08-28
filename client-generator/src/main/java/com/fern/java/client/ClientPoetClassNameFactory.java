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

import com.fern.ir.model.errors.ErrorDeclaration;
import com.fern.ir.model.ir.IntermediateRepresentation;
import com.fern.ir.model.services.commons.DeclaredServiceName;
import com.fern.ir.model.services.http.HttpEndpoint;
import com.fern.ir.model.services.http.HttpService;
import com.fern.java.AbstractPoetClassNameFactory;
import com.squareup.javapoet.ClassName;
import java.util.Optional;

public final class ClientPoetClassNameFactory extends AbstractPoetClassNameFactory {

    public ClientPoetClassNameFactory(IntermediateRepresentation ir, String organization) {
        super(ir, organization);
    }

    @Override
    public String rootPackageName() {
        return "client";
    }

    public ClassName getErrorClassName(ErrorDeclaration errorDeclaration) {
        String packageName = getErrorsPackageName(errorDeclaration.getName().getFernFilepath());
        return ClassName.get(packageName, errorDeclaration.getName().getName());
    }

    public ClassName getEndpointClassName(DeclaredServiceName declaredServiceName, HttpEndpoint httpEndpoint) {
        String packageName = getEndpointsPackageName(declaredServiceName.getFernFilepath());
        return ClassName.get(packageName, httpEndpoint.getName().getPascalCase());
    }

    public ClassName getEndpointExceptionClassName(DeclaredServiceName declaredServiceName, HttpEndpoint httpEndpoint) {
        String packageName = getExceptionsPackageName(declaredServiceName.getFernFilepath());
        return ClassName.get(packageName, httpEndpoint.getName().getPascalCase() + "Exception");
    }

    public ClassName getServiceInterfaceClassName(HttpService httpService) {
        String packageName = getPackage(Optional.of(httpService.getName().getFernFilepath()), Optional.empty());
        return ClassName.get(packageName, httpService.getName().getName());
    }

    public ClassName getServiceErrorDecoderClassname(HttpService httpService) {
        String packageName = getPackage(Optional.of(httpService.getName().getFernFilepath()), Optional.empty());
        return ClassName.get(packageName, httpService.getName().getName() + "ErrorDecoder");
    }

    public ClassName getServiceClientClassname(HttpService httpService) {
        String packageName = getPackage(Optional.of(httpService.getName().getFernFilepath()), Optional.empty());
        return ClassName.get(packageName, httpService.getName().getName() + "Client");
    }
}
