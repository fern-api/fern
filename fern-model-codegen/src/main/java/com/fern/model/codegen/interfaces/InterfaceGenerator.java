package com.fern.model.codegen.interfaces;

import com.fern.NamedTypeReference;
import com.fern.ObjectTypeDefinition;
import com.fern.model.codegen.Generator;
import com.fern.model.codegen.GeneratorContext;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.TypeSpec;

public final class InterfaceGenerator extends Generator<ObjectTypeDefinition> {

    private static final String INTERFACE_PREFIX = "I";
    private static final String INTERFACES_PACKAGE_NAME = "interfaces";

    private final ObjectTypeDefinition objectTypeDefinition;
    private final NamedTypeReference namedTypeReference;

    public InterfaceGenerator(
            ObjectTypeDefinition objectTypeDefinition,
            NamedTypeReference namedTypeReference,
            GeneratorContext generatorContext) {
        super(generatorContext);
        this.objectTypeDefinition = objectTypeDefinition;
        this.namedTypeReference = namedTypeReference;
    }

    public GeneratedInterface generate() {
        ClassName generatedInterfaceClassName = getInterfaceClassName();
        TypeSpec interfaceTypeSpec = TypeSpec.interfaceBuilder(INTERFACE_PREFIX + namedTypeReference.name())
                .addMethods(generatorContext.getImmutablesUtils().getImmutablesPropertyMethods(objectTypeDefinition))
                .build();
        JavaFile interfaceFile = JavaFile.builder(generatedInterfaceClassName.packageName(), interfaceTypeSpec)
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
        String nonInterfacePackageName =
                generatorContext.getFilepathUtils().convertFilepathToPackage(interfaceNamedTypeReference.filepath());
        return ClassName.get(nonInterfacePackageName + "." + INTERFACES_PACKAGE_NAME, namedTypeReference.name());
    }
}
