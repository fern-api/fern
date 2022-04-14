package com.fern.model.codegen.interfaces;

import com.fern.NamedTypeReference;
import com.fern.ObjectTypeDefinition;
import com.fern.model.codegen.utils.ClassNameUtils;
import com.fern.model.codegen.utils.FilepathUtils;
import com.fern.model.codegen.utils.ImmutablesUtils;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.TypeSpec;

public final class InterfaceGenerator {

    private static final String INTERFACE_PREFIX = "I";

    private final ObjectTypeDefinition objectTypeDefinition;
    private final NamedTypeReference namedTypeReference;

    public InterfaceGenerator(ObjectTypeDefinition objectTypeDefinition, NamedTypeReference namedTypeReference) {
        this.objectTypeDefinition = objectTypeDefinition;
        this.namedTypeReference = namedTypeReference;
    }

    public GeneratedInterface generate() {
        ClassName generatedInterfaceClassName = getInterfaceClassName();
        TypeSpec interfaceTypeSpec = TypeSpec.interfaceBuilder(INTERFACE_PREFIX + namedTypeReference.name())
                .addMethods(ImmutablesUtils.getImmutablesPropertyMethods(objectTypeDefinition))
                .build();
        JavaFile interfaceFile = JavaFile.builder(
                        FilepathUtils.convertFilepathToPackage(namedTypeReference.filepath()), interfaceTypeSpec)
                .build();
        return GeneratedInterface.builder()
                .file(interfaceFile)
                .definition(objectTypeDefinition)
                .className(generatedInterfaceClassName)
                .build();
    }

    private ClassName getInterfaceClassName() {
        NamedTypeReference interfaceNamedTypeReference = NamedTypeReference.builder()
                .filepath(namedTypeReference.filepath())
                .name(INTERFACE_PREFIX + namedTypeReference.name())
                .build();
        return ClassNameUtils.getClassName(interfaceNamedTypeReference);
    }
}
