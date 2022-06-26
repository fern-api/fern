package com.fern.model.codegen;

import com.fern.codegen.GeneratedAlias;
import com.fern.codegen.GeneratedEndpointModel;
import com.fern.codegen.GeneratedEnum;
import com.fern.codegen.GeneratedError;
import com.fern.codegen.GeneratedFile;
import com.fern.codegen.GeneratedInterface;
import com.fern.codegen.GeneratedObject;
import com.fern.codegen.GeneratedUnion;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.IGeneratedFile;
import com.fern.codegen.ImmutableGeneratedEndpointModel;
import com.fern.codegen.payload.GeneratedFilePayload;
import com.fern.codegen.payload.Payload;
import com.fern.codegen.payload.TypeNamePayload;
import com.fern.codegen.payload.VoidPayload;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.model.codegen.errors.ErrorGenerator;
import com.fern.model.codegen.services.payloads.FailedResponseGenerator;
import com.fern.model.codegen.services.payloads.RequestResponseGenerator;
import com.fern.model.codegen.services.payloads.RequestResponseGeneratorResult;
import com.fern.model.codegen.types.InterfaceGenerator;
import com.fern.types.errors.ErrorDeclaration;
import com.fern.types.errors.ErrorName;
import com.fern.types.services.http.HttpEndpoint;
import com.fern.types.services.http.HttpService;
import com.fern.types.types.DeclaredTypeName;
import com.fern.types.types.ObjectTypeDeclaration;
import com.fern.types.types.Type;
import com.fern.types.types.TypeDeclaration;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.function.Supplier;
import java.util.stream.Collectors;

public final class ModelGenerator {

    private final List<HttpService> httpServices;
    private final List<TypeDeclaration> typeDeclarations;
    private final List<ErrorDeclaration> errroDeclarations;
    private final Map<DeclaredTypeName, TypeDeclaration> typeDeclarationsByName;
    private final GeneratorContext generatorContext;

    public ModelGenerator(
            List<HttpService> httpServices,
            List<TypeDeclaration> typeDeclarations,
            List<ErrorDeclaration> errroDeclarations,
            GeneratorContext generatorContext) {
        this.httpServices = httpServices;
        this.typeDeclarations = typeDeclarations;
        this.errroDeclarations = errroDeclarations;
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
                    .visit(new TypeDefinitionGenerator(
                            typeDefinition, generatorContext, generatedInterfaces, PackageType.TYPES));
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
        Map<ErrorName, GeneratedError> generatedErrors = errroDeclarations.stream()
                .collect(Collectors.toMap(ErrorDeclaration::name, errorDefinition -> {
                    ErrorGenerator errorGenerator =
                            new ErrorGenerator(errorDefinition, generatorContext, generatedInterfaces);
                    return errorGenerator.generate();
                }));
        modelGeneratorResultBuilder.putAllErrors(generatedErrors);

        httpServices.forEach(httpService -> {
            List<GeneratedEndpointModel> generatedEndpointModels =
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

    private List<GeneratedEndpointModel> getGeneratedEndpointModels(
            HttpService httpService,
            Map<DeclaredTypeName, GeneratedInterface> generatedInterfaces,
            Map<ErrorName, GeneratedError> generatedErrors) {
        return httpService.endpoints().stream()
                .map(httpEndpoint -> {
                    ImmutableGeneratedEndpointModel.Builder generatedEndpointModel =
                            GeneratedEndpointModel.builder().httpEndpoint(httpEndpoint);

                    Payload requestPayload = generatePayload(
                            httpService,
                            httpEndpoint,
                            generatedInterfaces,
                            () -> httpEndpoint.request().type(),
                            true);
                    generatedEndpointModel.generatedHttpRequest(requestPayload);

                    Payload responsePayload = generatePayload(
                            httpService,
                            httpEndpoint,
                            generatedInterfaces,
                            () -> httpEndpoint.response().ok().type(),
                            false);
                    generatedEndpointModel.generatedHttpResponse(responsePayload);

                    if (!httpEndpoint.response().failed().errors().isEmpty()) {
                        FailedResponseGenerator failedResponseGenerator = new FailedResponseGenerator(
                                httpService,
                                httpEndpoint,
                                httpEndpoint.response().failed(),
                                generatorContext,
                                generatedErrors);
                        generatedEndpointModel.errorFile(failedResponseGenerator.generate());
                    }
                    return generatedEndpointModel.build();
                })
                .collect(Collectors.toList());
    }

    private Payload generatePayload(
            HttpService httpService,
            HttpEndpoint httpEndpoint,
            Map<DeclaredTypeName, GeneratedInterface> generatedInterfaces,
            Supplier<Type> typeSupplier,
            boolean isRequest) {
        if (isVoid(typeSupplier.get())) {
            return VoidPayload.INSTANCE;
        }
        RequestResponseGenerator generator = new RequestResponseGenerator(
                generatorContext, generatedInterfaces, httpService, httpEndpoint, typeSupplier.get(), isRequest);
        RequestResponseGeneratorResult result = generator.generate();
        if (result.generatedFile().isPresent()) {
            return GeneratedFilePayload.builder()
                    .generatedFile(GeneratedFile.builder()
                            .file(result.generatedFile().get().file())
                            .className(result.generatedFile().get().className())
                            .build())
                    .build();
        }
        return TypeNamePayload.builder().typeName(result.typeName()).build();
    }

    private static boolean isVoid(Type type) {
        return type.getAlias()
                .map(aliasTypeDefinition -> aliasTypeDefinition.aliasOf().isVoid())
                .orElse(false);
    }
}
