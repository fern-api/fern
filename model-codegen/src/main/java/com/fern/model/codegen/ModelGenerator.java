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
package com.fern.model.codegen;

import com.fern.codegen.GeneratedAlias;
import com.fern.codegen.GeneratedEndpointModel;
import com.fern.codegen.GeneratedEnum;
import com.fern.codegen.GeneratedError;
import com.fern.codegen.GeneratedInterface;
import com.fern.codegen.GeneratedObject;
import com.fern.codegen.GeneratedUnion;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.IGeneratedFile;
import com.fern.codegen.ImmutableGeneratedEndpointModel;
import com.fern.codegen.payload.Payload;
import com.fern.codegen.payload.TypeNamePayload;
import com.fern.codegen.payload.VoidPayload;
import com.fern.model.codegen.errors.ErrorGenerator;
import com.fern.model.codegen.services.payloads.FailedResponseGenerator;
import com.fern.model.codegen.types.InterfaceGenerator;
import com.fern.types.DeclaredErrorName;
import com.fern.types.DeclaredTypeName;
import com.fern.types.ErrorDeclaration;
import com.fern.types.ObjectTypeDeclaration;
import com.fern.types.Type;
import com.fern.types.TypeDeclaration;
import com.fern.types.TypeReference;
import com.fern.types.services.HttpEndpointId;
import com.fern.types.services.HttpService;
import com.squareup.javapoet.TypeName;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

public final class ModelGenerator {

    private final List<HttpService> httpServices;
    private final List<TypeDeclaration> typeDeclarations;
    private final List<ErrorDeclaration> errorDeclarations;
    private final Map<DeclaredTypeName, TypeDeclaration> typeDeclarationsByName;
    private final GeneratorContext generatorContext;

    public ModelGenerator(
            List<HttpService> httpServices,
            List<TypeDeclaration> typeDeclarations,
            List<ErrorDeclaration> errorDeclarations,
            GeneratorContext generatorContext) {
        this.httpServices = httpServices;
        this.typeDeclarations = typeDeclarations;
        this.errorDeclarations = errorDeclarations;
        this.typeDeclarationsByName = generatorContext.getTypeDefinitionsByName();
        this.generatorContext = generatorContext;
    }

    public ModelGeneratorResult generate() {
        ModelGeneratorResult.Builder modelGeneratorResultBuilder = ModelGeneratorResult.builder();
        Map<DeclaredTypeName, GeneratedInterface> generatedInterfaces = getGeneratedInterfaces();
        modelGeneratorResultBuilder.putAllInterfaces(generatedInterfaces);
        typeDeclarations.forEach(typeDefinition -> {
            IGeneratedFile generatedFile = typeDefinition
                    .shape()
                    .visit(new TypeDefinitionGenerator(typeDefinition, generatorContext, generatedInterfaces));
            if (generatedFile instanceof GeneratedObject) {
                modelGeneratorResultBuilder.addObjects((GeneratedObject) generatedFile);
            } else if (generatedFile instanceof GeneratedUnion) {
                modelGeneratorResultBuilder.addUnions((GeneratedUnion) generatedFile);
            } else if (generatedFile instanceof GeneratedAlias) {
                modelGeneratorResultBuilder.addAliases((GeneratedAlias) generatedFile);
            } else if (generatedFile instanceof GeneratedEnum) {
                modelGeneratorResultBuilder.addEnums((GeneratedEnum) generatedFile);
            } else {
                throw new RuntimeException(
                        "Encountered unknown model generator result type: " + generatedFile.className());
            }
        });
        Map<DeclaredErrorName, GeneratedError> generatedErrors = errorDeclarations.stream()
                .collect(Collectors.toMap(ErrorDeclaration::name, errorDefinition -> {
                    ErrorGenerator errorGenerator =
                            new ErrorGenerator(errorDefinition, generatorContext, generatedInterfaces);
                    return errorGenerator.generate();
                }));
        modelGeneratorResultBuilder.putAllErrors(generatedErrors);

        httpServices.forEach(httpService -> {
            Map<HttpEndpointId, GeneratedEndpointModel> generatedEndpointModels =
                    getGeneratedEndpointModels(httpService, generatedInterfaces, generatedErrors);
            modelGeneratorResultBuilder.putEndpointModels(httpService, generatedEndpointModels);
        });

        return modelGeneratorResultBuilder.build();
    }

    private Map<DeclaredTypeName, GeneratedInterface> getGeneratedInterfaces() {
        Set<DeclaredTypeName> interfaceCandidates = typeDeclarations.stream()
                .map(TypeDeclaration::shape)
                .map(Type::getObject)
                .flatMap(Optional::stream)
                .map(ObjectTypeDeclaration::_extends)
                .flatMap(List::stream)
                .collect(Collectors.toSet());
        return interfaceCandidates.stream().collect(Collectors.toMap(Function.identity(), namedType -> {
            TypeDeclaration typeDeclaration = typeDeclarationsByName.get(namedType);
            ObjectTypeDeclaration objectTypeDeclaration = typeDeclaration
                    .shape()
                    .getObject()
                    .orElseThrow(() -> new IllegalStateException("Non-objects cannot be extended. Fix type "
                            + typeDeclaration.name().name() + " located in file"
                            + typeDeclaration.name().fernFilepath()));
            InterfaceGenerator interfaceGenerator =
                    new InterfaceGenerator(objectTypeDeclaration, namedType, generatorContext);
            return interfaceGenerator.generate();
        }));
    }

    private Map<HttpEndpointId, GeneratedEndpointModel> getGeneratedEndpointModels(
            HttpService httpService,
            Map<DeclaredTypeName, GeneratedInterface> generatedInterfaces,
            Map<DeclaredErrorName, GeneratedError> generatedErrors) {
        return httpService.endpoints().stream()
                .map(httpEndpoint -> {
                    ImmutableGeneratedEndpointModel.Builder generatedEndpointModel =
                            GeneratedEndpointModel.builder().httpEndpoint(httpEndpoint);

                    Payload requestPayload =
                            generatePayload(httpEndpoint.request().type());
                    generatedEndpointModel.generatedHttpRequest(requestPayload);

                    Payload responsePayload =
                            generatePayload(httpEndpoint.response().type());
                    generatedEndpointModel.generatedHttpResponse(responsePayload);

                    if (!httpEndpoint.errors().value().isEmpty()) {
                        FailedResponseGenerator failedResponseGenerator = new FailedResponseGenerator(
                                httpService, httpEndpoint, generatorContext, generatedErrors);
                        generatedEndpointModel.errorFile(failedResponseGenerator.generate());
                    }
                    return generatedEndpointModel.build();
                })
                .collect(Collectors.toMap(
                        generatedEndpointModel ->
                                generatedEndpointModel.httpEndpoint().id(),
                        Function.identity()));
    }

    private Payload generatePayload(TypeReference typeReference) {
        if (typeReference.isVoid()) {
            return VoidPayload.INSTANCE;
        }
        TypeName typeName = generatorContext.getClassNameUtils().getTypeNameFromTypeReference(true, typeReference);
        return TypeNamePayload.builder().typeName(typeName).build();
    }
}
