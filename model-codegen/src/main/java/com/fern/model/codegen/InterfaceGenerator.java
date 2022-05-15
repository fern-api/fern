package com.fern.model.codegen;

import com.fern.codegen.GeneratedInterface;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.types.types.NamedType;
import com.fern.types.types.ObjectProperty;
import com.fern.types.types.ObjectTypeDefinition;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeSpec;
import java.util.Map;
import java.util.Optional;
import javax.lang.model.element.Modifier;

public final class InterfaceGenerator extends Generator {

    private static final String INTERFACE_PREFIX = "I";

    private final ObjectTypeDefinition objectTypeDefinition;
    private final NamedType namedType;

    public InterfaceGenerator(
            ObjectTypeDefinition objectTypeDefinition, NamedType namedType, GeneratorContext generatorContext) {
        super(generatorContext, PackageType.INTERFACES);
        this.objectTypeDefinition = objectTypeDefinition;
        this.namedType = namedType;
    }

    @Override
    public GeneratedInterface generate() {
        ClassName generatedInterfaceClassName = generatorContext
                .getClassNameUtils()
                .getClassName(INTERFACE_PREFIX + namedType.name(), Optional.of(packageType), Optional.empty());
        Map<ObjectProperty, MethodSpec> methodSpecsByProperties =
                generatorContext.getImmutablesUtils().getOrderedImmutablesPropertyMethods(objectTypeDefinition);
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
}
