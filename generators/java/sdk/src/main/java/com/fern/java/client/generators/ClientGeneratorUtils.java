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

package com.fern.java.client.generators;

import com.fern.ir.model.commons.ErrorId;
import com.fern.ir.model.commons.SubpackageId;
import com.fern.ir.model.commons.TypeId;
import com.fern.ir.model.http.HttpEndpoint;
import com.fern.ir.model.http.HttpService;
import com.fern.ir.model.ir.IPackage;
import com.fern.ir.model.ir.Subpackage;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.client.GeneratedClientOptions;
import com.fern.java.client.GeneratedEnvironmentsClass;
import com.fern.java.client.GeneratedWrappedRequest;
import com.fern.java.client.generators.endpoint.HttpEndpointMethodSpecFactory;
import com.fern.java.client.generators.endpoint.HttpEndpointMethodSpecs;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.output.GeneratedJavaInterface;
import com.fern.java.output.GeneratedObjectMapper;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.FieldSpec;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeSpec;
import com.squareup.javapoet.TypeSpec.Builder;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Supplier;
import javax.lang.model.element.Modifier;

public final class ClientGeneratorUtils {

    private final ClientGeneratorContext generatorContext;
    private final TypeSpec.Builder implBuilder;
    private final FieldSpec clientOptionsField;
    private final IPackage fernPackage;
    private final GeneratedObjectMapper generatedObjectMapper;
    private final GeneratedClientOptions generatedClientOptions;
    private final Map<TypeId, GeneratedJavaInterface> allGeneratedInterfaces;
    private final GeneratedJavaFile generatedSuppliersFile;
    private final GeneratedEnvironmentsClass generatedEnvironmentsClass;
    private final List<GeneratedWrappedRequest> generatedWrappedRequests = new ArrayList<>();
    private final GeneratedJavaFile requestOptionsFile;
    private final Map<ErrorId, GeneratedJavaFile> generatedErrors;

    public ClientGeneratorUtils(
            ClassName clientImplName,
            ClientGeneratorContext clientGeneratorContext,
            GeneratedClientOptions generatedClientOptions,
            GeneratedObjectMapper generatedObjectMapper,
            GeneratedEnvironmentsClass generatedEnvironmentsClass,
            Map<TypeId, GeneratedJavaInterface> allGeneratedInterfaces,
            GeneratedJavaFile generatedSuppliersFile,
            GeneratedJavaFile requestOptionsFile,
            IPackage fernPackage,
            Map<ErrorId, GeneratedJavaFile> generatedErrors) {
        this.generatorContext = clientGeneratorContext;
        this.clientOptionsField = FieldSpec.builder(generatedClientOptions.getClassName(), "clientOptions")
                .addModifiers(Modifier.PROTECTED, Modifier.FINAL)
                .build();
        this.fernPackage = fernPackage;
        this.implBuilder = TypeSpec.classBuilder(clientImplName)
                .addModifiers(Modifier.PUBLIC)
                .addField(clientOptionsField);
        this.allGeneratedInterfaces = allGeneratedInterfaces;
        this.generatedSuppliersFile = generatedSuppliersFile;
        this.generatedObjectMapper = generatedObjectMapper;
        this.generatedClientOptions = generatedClientOptions;
        this.generatedEnvironmentsClass = generatedEnvironmentsClass;
        this.requestOptionsFile = requestOptionsFile;
        this.generatedErrors = generatedErrors;
    }

    public Result buildClients() {
        Optional<HttpService> maybeHttpService = fernPackage
                .getService()
                .map(serviceId -> generatorContext.getIr().getServices().get(serviceId));
        MethodSpec.Builder clientImplConstructor = MethodSpec.constructorBuilder()
                .addModifiers(Modifier.PUBLIC)
                .addParameter(ParameterSpec.builder(clientOptionsField.type, clientOptionsField.name)
                        .build())
                .addStatement("this.$L = $L", clientOptionsField.name, clientOptionsField.name);
        if (maybeHttpService.isPresent()) {
            HttpService httpService = maybeHttpService.get();
            for (HttpEndpoint httpEndpoint : httpService.getEndpoints()) {
                HttpEndpointMethodSpecFactory httpEndpointMethodSpecFactory = new HttpEndpointMethodSpecFactory(
                        httpService,
                        httpEndpoint,
                        generatedObjectMapper,
                        generatorContext,
                        generatedClientOptions,
                        clientOptionsField,
                        generatedEnvironmentsClass,
                        allGeneratedInterfaces,
                        generatedErrors);
                HttpEndpointMethodSpecs httpEndpointMethodSpecs = httpEndpointMethodSpecFactory.create();
                if (httpEndpointMethodSpecs.getNoRequestBodyMethodSpec().isPresent()) {
                    implBuilder.addMethod(
                            httpEndpointMethodSpecs.getNoRequestBodyMethodSpec().get());
                }
                implBuilder.addMethod(httpEndpointMethodSpecs.getNonRequestOptionsMethodSpec());
                implBuilder.addMethod(httpEndpointMethodSpecs.getRequestOptionsMethodSpec());
                generatedWrappedRequests.addAll(httpEndpointMethodSpecFactory.getGeneratedWrappedRequests());
            }
        }

        for (SubpackageId subpackageId : fernPackage.getSubpackages()) {
            Subpackage subpackage = generatorContext.getIr().getSubpackages().get(subpackageId);
            if (!subpackage.getHasEndpointsInTree()) {
                continue;
            }
            ClassName subpackageClientImpl =
                    generatorContext.getPoetClassNameFactory().getClientClassName(subpackage);
            FieldSpec clientSupplierField = FieldSpec.builder(
                            ParameterizedTypeName.get(ClassName.get(Supplier.class), subpackageClientImpl),
                            subpackage.getName().getCamelCase().getUnsafeName() + "Client")
                    .addModifiers(Modifier.PROTECTED, Modifier.FINAL)
                    .build();
            implBuilder.addField(clientSupplierField);
            clientImplConstructor.addStatement(
                    "this.$L = $T.$L(() -> new $T($L))",
                    clientSupplierField.name,
                    generatedSuppliersFile.getClassName(),
                    SuppliersGenerator.MEMOIZE_METHOD_NAME,
                    subpackageClientImpl,
                    clientOptionsField.name);
            implBuilder.addMethod(getBaseSubpackageMethod(subpackage, subpackageClientImpl)
                    .addStatement("return this.$L.get()", clientSupplierField.name)
                    .build());
        }
        implBuilder.addMethod(clientImplConstructor.build());
        return new Result(implBuilder, generatedWrappedRequests);
    }

    private MethodSpec.Builder getBaseSubpackageMethod(Subpackage subpackage, ClassName subpackageClientInterface) {
        return MethodSpec.methodBuilder(subpackage.getName().getCamelCase().getSafeName())
                .addModifiers(Modifier.PUBLIC)
                .returns(subpackageClientInterface);
    }

    public static final class Result {
        private final TypeSpec.Builder clientImpl;
        private final List<GeneratedWrappedRequest> generatedWrappedRequests;

        public Result(TypeSpec.Builder implBuilder, List<GeneratedWrappedRequest> generatedWrappedRequests) {
            this.clientImpl = implBuilder;
            this.generatedWrappedRequests = generatedWrappedRequests;
        }

        public Builder getClientImpl() {
            return clientImpl;
        }

        public List<GeneratedWrappedRequest> getGeneratedWrappedRequests() {
            return generatedWrappedRequests;
        }
    }
}
