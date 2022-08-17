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
package com.fern.model.codegen.services.payloads;

import com.fern.codegen.GeneratedEnum;
import com.fern.codegen.GeneratedInterface;
import com.fern.codegen.GeneratedObject;
import com.fern.codegen.GeneratedUnion;
import com.fern.codegen.GeneratorContext;
import com.fern.model.codegen.types.EnumGenerator;
import com.fern.model.codegen.types.ObjectGenerator;
import com.fern.model.codegen.types.UnionGenerator;
import com.fern.types.AliasTypeDeclaration;
import com.fern.types.DeclaredTypeName;
import com.fern.types.EnumTypeDeclaration;
import com.fern.types.ObjectTypeDeclaration;
import com.fern.types.Type;
import com.fern.types.UnionTypeDeclaration;
import com.fern.types.services.HttpEndpoint;
import com.fern.types.services.HttpService;
import com.squareup.javapoet.TypeName;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

public final class RequestResponseGenerator {

    private final GeneratorContext generatorContext;
    private final Map<DeclaredTypeName, GeneratedInterface> generatedInterfaces;
    private final HttpService httpService;
    private final HttpEndpoint httpEndpoint;
    private final Type type;
    private final boolean isRequest;

    public RequestResponseGenerator(
            GeneratorContext generatorContext,
            Map<DeclaredTypeName, GeneratedInterface> generatedInterfaces,
            HttpService httpService,
            HttpEndpoint httpEndpoint,
            Type type,
            boolean isRequest) {
        this.generatorContext = generatorContext;
        this.generatedInterfaces = generatedInterfaces;
        this.httpService = httpService;
        this.httpEndpoint = httpEndpoint;
        this.type = type;
        this.isRequest = isRequest;
    }

    public RequestResponseGeneratorResult generate() {
        return type.visit(new RequestResponseTypeVisitor());
    }

    private DeclaredTypeName getDeclaredTypeName() {
        String wireMessageSuffix = isRequest ? "Request" : "Response";
        return DeclaredTypeName.builder()
                .fernFilepath(httpService.name().fernFilepath())
                .name(httpEndpoint.id().value() + wireMessageSuffix)
                .build();
    }

    public final class RequestResponseTypeVisitor implements Type.Visitor<RequestResponseGeneratorResult> {

        @Override
        public RequestResponseGeneratorResult visitAlias(AliasTypeDeclaration aliasTypeDeclaration) {
            TypeName aliasTypeName = generatorContext
                    .getClassNameUtils()
                    .getTypeNameFromTypeReference(true, aliasTypeDeclaration.aliasOf());
            return RequestResponseGeneratorResult.builder()
                    .typeName(aliasTypeName)
                    .build();
        }

        @Override
        public RequestResponseGeneratorResult visitEnum(EnumTypeDeclaration enumTypeDeclaration) {
            EnumGenerator enumGenerator =
                    new EnumGenerator(getDeclaredTypeName(), enumTypeDeclaration, generatorContext);
            GeneratedEnum generatedEnum = enumGenerator.generate();
            return RequestResponseGeneratorResult.builder()
                    .typeName(generatedEnum.className())
                    .generatedFile(generatedEnum)
                    .build();
        }

        @Override
        public RequestResponseGeneratorResult visitObject(ObjectTypeDeclaration objectTypeDeclaration) {
            List<GeneratedInterface> extendedInterfaces = objectTypeDeclaration._extends().stream()
                    .map(generatedInterfaces::get)
                    .sorted(Comparator.comparing(
                            generatedInterface -> generatedInterface.className().simpleName()))
                    .collect(Collectors.toList());
            ObjectGenerator objectGenerator = new ObjectGenerator(
                    getDeclaredTypeName(),
                    objectTypeDeclaration,
                    extendedInterfaces,
                    Optional.empty(),
                    generatorContext);
            GeneratedObject generatedObject = objectGenerator.generate();
            return RequestResponseGeneratorResult.builder()
                    .typeName(generatedObject.className())
                    .generatedFile(generatedObject)
                    .build();
        }

        @Override
        public RequestResponseGeneratorResult visitUnion(UnionTypeDeclaration unionTypeDeclaration) {
            UnionGenerator unionGenerator =
                    new UnionGenerator(getDeclaredTypeName(), unionTypeDeclaration, generatorContext);
            GeneratedUnion generatedUnion = unionGenerator.generate();
            return RequestResponseGeneratorResult.builder()
                    .typeName(generatedUnion.className())
                    .generatedFile(generatedUnion)
                    .build();
        }

        @Override
        public RequestResponseGeneratorResult visitUnknown(String unknownType) {
            throw new RuntimeException("Encountered unknown Type in Wire Reference: " + unknownType);
        }
    }
}
