package com.fern.java;

import com.fern.generator.exec.model.config.GeneratorConfig;
import com.fern.ir.model.auth.AuthScheme;
import com.fern.ir.model.commons.ErrorId;
import com.fern.ir.model.commons.TypeId;
import com.fern.ir.model.errors.ErrorDeclaration;
import com.fern.ir.model.http.HttpEndpoint;
import com.fern.ir.model.http.HttpRequestBody;
import com.fern.ir.model.http.InlinedRequestBody;
import com.fern.ir.model.ir.IntermediateRepresentation;
import com.fern.ir.model.types.DeclaredTypeName;
import com.fern.ir.model.types.ObjectTypeDeclaration;
import com.fern.ir.model.types.Type;
import com.fern.ir.model.types.TypeDeclaration;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

public abstract class AbstractGeneratorContext<T extends AbstractPoetClassNameFactory, U extends ICustomConfig> {

    private final IntermediateRepresentation ir;
    private final GeneratorConfig generatorConfig;
    private final T poetClassNameFactory;
    private final PoetTypeNameMapper poetTypeNameMapper;
    private final Map<TypeId, TypeDeclaration> typeDefinitionsByName;
    private final Map<ErrorId, ErrorDeclaration> errorDefinitionsByName;
    private final GlobalHeaders globalHeaders;
    private final Set<TypeId> interfaces;
    private final U customConfig;
    private final List<AuthScheme> resolvedAuthSchemes;

    public AbstractGeneratorContext(
            IntermediateRepresentation ir,
            GeneratorConfig generatorConfig,
            U customConfig,
            T poetClassNameFactory,
            List<AuthScheme> resolvedAuthSchemes) {
        this.ir = ir;
        this.generatorConfig = generatorConfig;
        this.customConfig = customConfig;
        this.poetClassNameFactory = poetClassNameFactory;
        this.typeDefinitionsByName = ir.getTypes();
        this.resolvedAuthSchemes = resolvedAuthSchemes;
        this.poetTypeNameMapper = new PoetTypeNameMapper(poetClassNameFactory, customConfig, typeDefinitionsByName);
        this.errorDefinitionsByName = ir.getErrors();
        this.globalHeaders = new GlobalHeaders(ir, poetTypeNameMapper);
        this.interfaces = getInterfaceTypeIds(ir);
    }

    public abstract boolean deserializeWithAdditionalProperties();

    public final IntermediateRepresentation getIr() {
        return ir;
    }

    public final GeneratorConfig getGeneratorConfig() {
        return generatorConfig;
    }

    public final U getCustomConfig() {
        return customConfig;
    }

    public final T getPoetClassNameFactory() {
        return poetClassNameFactory;
    }

    public final PoetTypeNameMapper getPoetTypeNameMapper() {
        return poetTypeNameMapper;
    }

    public final Map<TypeId, TypeDeclaration> getTypeDeclarations() {
        return typeDefinitionsByName;
    }

    public final Map<ErrorId, ErrorDeclaration> getErrorDeclarations() {
        return errorDefinitionsByName;
    }

    public final Set<TypeId> getInterfaceIds() {
        return this.interfaces;
    }

    public final GlobalHeaders getGlobalHeaders() {
        return globalHeaders;
    }

    public List<AuthScheme> getResolvedAuthSchemes() {
        return resolvedAuthSchemes;
    }

    private static Set<TypeId> getInterfaceTypeIds(IntermediateRepresentation ir) {
        Set<TypeId> extendedTypeIdsFromTypes = ir.getTypes().values().stream()
                .map(TypeDeclaration::getShape)
                .map(Type::getObject)
                .flatMap(Optional::stream)
                .map(ObjectTypeDeclaration::getExtends)
                .flatMap(List::stream)
                .map(DeclaredTypeName::getTypeId)
                .collect(Collectors.toSet());
        Set<TypeId> extendedTypeIdsFromInlinedRequests = ir.getServices().values().stream()
                .flatMap(httpService -> httpService.getEndpoints().stream())
                .map(HttpEndpoint::getRequestBody)
                .flatMap(Optional::stream)
                .map(HttpRequestBody::getInlinedRequestBody)
                .flatMap(Optional::stream)
                .map(InlinedRequestBody::getExtends)
                .flatMap(List::stream)
                .map(DeclaredTypeName::getTypeId)
                .collect(Collectors.toSet());
        Set<TypeId> result = new HashSet<>();
        result.addAll(extendedTypeIdsFromTypes);
        result.addAll(extendedTypeIdsFromInlinedRequests);
        return result;
    }
}
