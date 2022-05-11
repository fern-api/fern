package com.fern.jersey;

import com.fern.codegen.GeneratedEnum;
import com.fern.codegen.GeneratedInterface;
import com.fern.codegen.GeneratedObject;
import com.fern.codegen.GeneratedUnion;
import com.fern.codegen.GeneratedWireMessage;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.IGeneratedFile;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.model.codegen.EnumGenerator;
import com.fern.model.codegen.ObjectGenerator;
import com.fern.model.codegen.UnionGenerator;
import com.services.commons.WireMessage;
import com.services.http.HttpEndpoint;
import com.services.http.HttpService;
import com.squareup.javapoet.TypeName;
import com.types.AliasTypeDefinition;
import com.types.EnumTypeDefinition;
import com.types.NamedType;
import com.types.ObjectTypeDefinition;
import com.types.Type;
import com.types.UnionTypeDefinition;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

public final class ServiceWireMessageGenerator {

    private final GeneratorContext generatorContext;
    private final Map<NamedType, GeneratedInterface> generatedInterfaces;
    private final HttpService httpService;
    private final HttpEndpoint httpEndpoint;
    private final WireMessage wireMessage;
    private final boolean isRequest;

    public ServiceWireMessageGenerator(
            GeneratorContext generatorContext,
            Map<NamedType, GeneratedInterface> generatedInterfaces,
            HttpService httpService,
            HttpEndpoint httpEndpoint,
            WireMessage wireMessage,
            boolean isRequest) {
        this.generatorContext = generatorContext;
        this.generatedInterfaces = generatedInterfaces;
        this.httpService = httpService;
        this.httpEndpoint = httpEndpoint;
        this.wireMessage = wireMessage;
        this.isRequest = isRequest;
    }

    public WireMessageGeneratorResult generate() {
        return wireMessage.type().accept(new WireMessageVisitor());
    }

    private NamedType getNamedType() {
        String wireMessageSuffix = isRequest ? "Request" : "Response";
        return NamedType.builder()
                .fernFilepath(httpService.name().fernFilepath())
                .name(httpEndpoint.endpointId() + wireMessageSuffix)
                .build();
    }

    public final class WireMessageVisitor implements Type.Visitor<WireMessageGeneratorResult> {

        @Override
        public WireMessageGeneratorResult visitAlias(AliasTypeDefinition aliasTypeDefinition) {
            TypeName aliasTypeName = generatorContext
                    .getClassNameUtils()
                    .getTypeNameFromTypeReference(true, aliasTypeDefinition.aliasOf());
            return WireMessageGeneratorResult.builder().typeName(aliasTypeName).build();
        }

        @Override
        public WireMessageGeneratorResult visitEnum(EnumTypeDefinition enumTypeDefinition) {
            EnumGenerator enumGenerator = new EnumGenerator(
                    getNamedType(), PackageType.REQUEST_RESPONSES, enumTypeDefinition, generatorContext);
            GeneratedEnum generatedEnum = enumGenerator.generate();
            return WireMessageGeneratorResult.builder()
                    .typeName(generatedEnum.className())
                    .generatedWireMessage(getGeneratedWireMessage(generatedEnum))
                    .build();
        }

        @Override
        public WireMessageGeneratorResult visitObject(ObjectTypeDefinition objectTypeDefinition) {
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
            return WireMessageGeneratorResult.builder()
                    .typeName(generatedObject.className())
                    .generatedWireMessage(getGeneratedWireMessage(generatedObject))
                    .build();
        }

        @Override
        public WireMessageGeneratorResult visitUnion(UnionTypeDefinition unionTypeDefinition) {
            UnionGenerator unionGenerator = new UnionGenerator(
                    getNamedType(), PackageType.REQUEST_RESPONSES, unionTypeDefinition, generatorContext);
            GeneratedUnion generatedUnion = unionGenerator.generate();
            return WireMessageGeneratorResult.builder()
                    .typeName(generatedUnion.className())
                    .generatedWireMessage(getGeneratedWireMessage(generatedUnion))
                    .build();
        }

        @Override
        public WireMessageGeneratorResult visitUnknown(String unknownType) {
            throw new RuntimeException("Encountered unknown Type in Wire Reference: " + unknownType);
        }

        private GeneratedWireMessage getGeneratedWireMessage(IGeneratedFile generatedFile) {
            return GeneratedWireMessage.builder()
                    .file(generatedFile.file())
                    .className(generatedFile.className())
                    .wireMessage(wireMessage)
                    .build();
        }
    }
}
