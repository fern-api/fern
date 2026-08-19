package com.fern.java.utils;

import com.fern.ir.model.commons.TypeId;
import com.fern.ir.model.types.TypeDeclaration;
import com.fern.ir.model.types.TypeReference;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.output.GeneratedObjectMapper;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.CodeBlock;
import com.squareup.javapoet.ParameterizedTypeName;
import com.squareup.javapoet.TypeName;
import java.util.Optional;

public final class ObjectMapperUtils {

    private final AbstractGeneratorContext<?, ?> context;
    private final GeneratedObjectMapper generatedObjectMapper;

    public ObjectMapperUtils(AbstractGeneratorContext<?, ?> context, GeneratedObjectMapper generatedObjectMapper) {
        this.context = context;
        this.generatedObjectMapper = generatedObjectMapper;
    }

    public CodeBlock readValueCall(CodeBlock dataVariableReference, Optional<TypeReference> dataVariableType) {
        CodeBlock typeReferenceBlock;

        if (dataVariableType.isPresent()) {
            TypeName dataVariableTypeName =
                    context.getPoetTypeNameMapper().convertToTypeName(true, dataVariableType.get());

            if (dataVariableType.get().isContainer() || isAliasContainer(dataVariableType.get())) {
                typeReferenceBlock = CodeBlock.of(
                        "new $T() {}",
                        ParameterizedTypeName.get(
                                ClassName.get(com.fasterxml.jackson.core.type.TypeReference.class),
                                dataVariableTypeName));
            } else {
                typeReferenceBlock = CodeBlock.of("$T.class", dataVariableTypeName);
            }
        } else {
            typeReferenceBlock = CodeBlock.of("$T.class", Object.class);
        }

        return CodeBlock.of(
                "$T.$L.readValue($L, $L)",
                generatedObjectMapper.getClassName(),
                generatedObjectMapper.jsonMapperStaticField().name,
                dataVariableReference,
                typeReferenceBlock);
    }

    private boolean isAliasContainer(com.fern.ir.model.types.TypeReference responseBodyType) {
        if (responseBodyType.getNamed().isPresent()) {
            TypeId typeId = responseBodyType.getNamed().get().getTypeId();
            TypeDeclaration typeDeclaration = context.getIr().getTypes().get(typeId);
            return typeDeclaration.getShape().getAlias().isPresent()
                    && typeDeclaration
                            .getShape()
                            .getAlias()
                            .get()
                            .getResolvedType()
                            .isContainer();
        }
        return false;
    }
}
