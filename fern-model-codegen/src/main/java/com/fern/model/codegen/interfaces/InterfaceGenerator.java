package com.fern.model.codegen.interfaces;

import com.fern.model.codegen.Generator;
import com.fern.model.codegen.GeneratorContext;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeSpec;
import com.types.NamedType;
import com.types.ObjectProperty;
import com.types.ObjectTypeDefinition;
import java.util.Map;
import javax.lang.model.element.Modifier;

public final class InterfaceGenerator extends Generator {

    private static final String INTERFACE_PREFIX = "I";
    private static final String INTERFACES_PACKAGE_NAME = "interfaces";

    private final ObjectTypeDefinition objectTypeDefinition;
    private final NamedType namedType;

    public InterfaceGenerator(
            ObjectTypeDefinition objectTypeDefinition, NamedType namedType, GeneratorContext generatorContext) {
        super(generatorContext);
        this.objectTypeDefinition = objectTypeDefinition;
        this.namedType = namedType;
    }

    @Override
    public GeneratedInterface generate() {
        ClassName generatedInterfaceClassName = getInterfaceClassName();
        Map<ObjectProperty, MethodSpec> methodSpecsByProperties =
                generatorContext.getImmutablesUtils().getImmutablesPropertyMethods(objectTypeDefinition);
        TypeSpec interfaceTypeSpec = TypeSpec.interfaceBuilder(generatedInterfaceClassName.simpleName())
                .addModifiers(Modifier.PUBLIC)
                .addMethods(methodSpecsByProperties.values())
                .build();
        JavaFile interfaceFile = JavaFile.builder(generatedInterfaceClassName.packageName(), interfaceTypeSpec)
                .build();
        return GeneratedInterface.builder()
                .file(interfaceFile)
                .className(generatedInterfaceClassName)
                .objectTypeDefinition(objectTypeDefinition)
                .putAllMethodSpecsByProperties(methodSpecsByProperties)
                .build();
    }

    private ClassName getInterfaceClassName() {
        String nonInterfacePackageName =
                generatorContext.getClassNameUtils().getPackageFromFilepath(namedType.fernFilepath());
        return ClassName.get(
                nonInterfacePackageName + "." + INTERFACES_PACKAGE_NAME, INTERFACE_PREFIX + namedType.name());
    }
}
