package com.fern.model.codegen.types;

import com.fern.codegen.GeneratedInterface;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.model.codegen.Generator;
import com.fern.types.types.DeclaredTypeName;
import com.fern.types.types.ObjectProperty;
import com.fern.types.types.ObjectTypeDeclaration;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.TypeSpec;
import java.util.Map;
import javax.lang.model.element.Modifier;

public final class InterfaceGenerator extends Generator {

    private static final String INTERFACE_PREFIX = "I";

    private final ObjectTypeDeclaration objectTypeDeclaration;
    private final DeclaredTypeName declaredTypeName;

    public InterfaceGenerator(
            ObjectTypeDeclaration objectTypeDeclaration,
            DeclaredTypeName declaredTypeName,
            GeneratorContext generatorContext) {
        super(generatorContext, PackageType.INTERFACES);
        this.objectTypeDeclaration = objectTypeDeclaration;
        this.declaredTypeName = DeclaredTypeName.builder()
                .fernFilepath(declaredTypeName.fernFilepath())
                .name(INTERFACE_PREFIX + declaredTypeName.name())
                .build();
    }

    @Override
    public GeneratedInterface generate() {
        ClassName generatedInterfaceClassName =
                generatorContext.getClassNameUtils().getClassNameFromDeclaredTypeName(declaredTypeName, packageType);
        Map<ObjectProperty, MethodSpec> methodSpecsByProperties =
                generatorContext.getImmutablesUtils().getOrderedImmutablesPropertyMethods(objectTypeDeclaration);
        TypeSpec interfaceTypeSpec = TypeSpec.interfaceBuilder(generatedInterfaceClassName.simpleName())
                .addModifiers(Modifier.PUBLIC)
                .addMethods(methodSpecsByProperties.values())
                .build();
        JavaFile interfaceFile = JavaFile.builder(generatedInterfaceClassName.packageName(), interfaceTypeSpec)
                .build();
        return GeneratedInterface.builder()
                .file(interfaceFile)
                .className(generatedInterfaceClassName)
                .objectTypeDeclaration(objectTypeDeclaration)
                .putAllMethodSpecsByProperties(methodSpecsByProperties)
                .build();
    }
}
