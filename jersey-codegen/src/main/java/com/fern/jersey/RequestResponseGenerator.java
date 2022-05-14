package com.fern.jersey;

import com.fern.codegen.GeneratedEnum;
import com.fern.codegen.GeneratedInterface;
import com.fern.codegen.GeneratedObject;
import com.fern.codegen.GeneratedUnion;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.model.codegen.EnumGenerator;
import com.fern.model.codegen.ObjectGenerator;
import com.fern.model.codegen.UnionGenerator;
import com.fern.types.services.http.HttpEndpoint;
import com.fern.types.services.http.HttpService;
import com.fern.types.types.AliasTypeDefinition;
import com.fern.types.types.EnumTypeDefinition;
import com.fern.types.types.NamedType;
import com.fern.types.types.ObjectTypeDefinition;
import com.fern.types.types.Type;
import com.fern.types.types.UnionTypeDefinition;
import com.squareup.javapoet.TypeName;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

public final class RequestResponseGenerator {

    private final GeneratorContext generatorContext;
    private final Map<NamedType, GeneratedInterface> generatedInterfaces;
    private final HttpService httpService;
    private final HttpEndpoint httpEndpoint;
    private final Type type;
    private final boolean isRequest;

    public RequestResponseGenerator(
            GeneratorContext generatorContext,
            Map<NamedType, GeneratedInterface> generatedInterfaces,
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

    private NamedType getNamedType() {
        String wireMessageSuffix = isRequest ? "Request" : "Response";
        return NamedType.builder()
                .fernFilepath(httpService.name().fernFilepath())
                .name(httpEndpoint.endpointId() + wireMessageSuffix)
                .build();
    }

    public final class RequestResponseTypeVisitor implements Type.Visitor<RequestResponseGeneratorResult> {

        @Override
        public RequestResponseGeneratorResult visitAlias(AliasTypeDefinition aliasTypeDefinition) {
            TypeName aliasTypeName = generatorContext
                    .getClassNameUtils()
                    .getTypeNameFromTypeReference(true, aliasTypeDefinition.aliasOf());
            return RequestResponseGeneratorResult.builder()
                    .typeName(aliasTypeName)
                    .build();
        }

        @Override
        public RequestResponseGeneratorResult visitEnum(EnumTypeDefinition enumTypeDefinition) {
            EnumGenerator enumGenerator = new EnumGenerator(
                    getNamedType(), PackageType.REQUEST_RESPONSES, enumTypeDefinition, generatorContext);
            GeneratedEnum generatedEnum = enumGenerator.generate();
            return RequestResponseGeneratorResult.builder()
                    .typeName(generatedEnum.className())
                    .generatedFile(generatedEnum)
                    .build();
        }

        @Override
        public RequestResponseGeneratorResult visitObject(ObjectTypeDefinition objectTypeDefinition) {
            List<GeneratedInterface> extendedInterfaces = objectTypeDefinition._extends().stream()
                    .map(generatedInterfaces::get)
                    .sorted(Comparator.comparing(
                            generatedInterface -> generatedInterface.className().simpleName()))
                    .collect(Collectors.toList());
            ObjectGenerator objectGenerator = new ObjectGenerator(
                    getNamedType(),
                    PackageType.REQUEST_RESPONSES,
                    objectTypeDefinition,
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
        public RequestResponseGeneratorResult visitUnion(UnionTypeDefinition unionTypeDefinition) {
            UnionGenerator unionGenerator = new UnionGenerator(
                    getNamedType(), PackageType.REQUEST_RESPONSES, unionTypeDefinition, generatorContext);
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
