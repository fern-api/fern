package com.fern.java.generators;

import com.fern.ir.model.commons.TypeId;
import com.fern.ir.model.types.AliasTypeDeclaration;
import com.fern.ir.model.types.DeclaredTypeName;
import com.fern.ir.model.types.EnumTypeDeclaration;
import com.fern.ir.model.types.ObjectTypeDeclaration;
import com.fern.ir.model.types.Type;
import com.fern.ir.model.types.UndiscriminatedUnionTypeDeclaration;
import com.fern.ir.model.types.UnionTypeDeclaration;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.output.GeneratedJavaInterface;
import com.fern.java.output.GeneratedObject;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.JavaFile;
import com.squareup.javapoet.TypeSpec;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

public final class SingleTypeGenerator implements Type.Visitor<GeneratedJavaFile> {

    private final AbstractGeneratorContext<?, ?> generatorContext;
    private final DeclaredTypeName declaredTypeName;
    private final ClassName className;
    private final Map<TypeId, GeneratedJavaInterface> allGeneratedInterfaces;
    private final boolean fromErrorDeclaration;
    private final TypeSpec typeSpec;

    public SingleTypeGenerator(
            AbstractGeneratorContext<?, ?> generatorContext,
            DeclaredTypeName declaredTypeName,
            ClassName className,
            Map<TypeId, GeneratedJavaInterface> allGeneratedInterfaces,
            boolean fromErrorDeclaration,
            TypeSpec typeSpec) {
        this.generatorContext = generatorContext;
        this.className = className;
        this.allGeneratedInterfaces = allGeneratedInterfaces;
        this.declaredTypeName = declaredTypeName;
        this.fromErrorDeclaration = fromErrorDeclaration;
        this.typeSpec = typeSpec;
    }

    @Override
    public GeneratedJavaFile visitAlias(AliasTypeDeclaration value) {
        return AbstractTypeGenerator.generateFile(className, typeSpec);
    }

    @Override
    public GeneratedJavaFile visitEnum(EnumTypeDeclaration value) {
        return AbstractTypeGenerator.generateFile(className, typeSpec);
    }

    @Override
    public GeneratedJavaFile visitObject(ObjectTypeDeclaration value) {
        List<GeneratedJavaInterface> extendedInterfaces = value.getExtends().stream()
                .map(DeclaredTypeName::getTypeId)
                .map(allGeneratedInterfaces::get)
                .collect(Collectors.toList());
        ObjectGenerator objectGenerator = new ObjectGenerator(
                value,
                Optional.ofNullable(allGeneratedInterfaces.get(declaredTypeName.getTypeId())),
                extendedInterfaces,
                generatorContext,
                allGeneratedInterfaces,
                className);
        GeneratedObject generatedObject = objectGenerator.generateFile();
        return GeneratedJavaFile.builder()
                .className(generatedObject.getClassName())
                .javaFile(JavaFile.builder(className.packageName(), typeSpec).build())
                .build();
    }

    @Override
    public GeneratedJavaFile visitUnion(UnionTypeDeclaration value) {
        return AbstractTypeGenerator.generateFile(className, typeSpec);
    }

    @Override
    public GeneratedJavaFile visitUndiscriminatedUnion(UndiscriminatedUnionTypeDeclaration undiscriminatedUnion) {
        return AbstractTypeGenerator.generateFile(className, typeSpec);
    }

    @Override
    public GeneratedJavaFile _visitUnknown(Object unknown) {
        return AbstractTypeGenerator.generateFile(className, typeSpec);
    }
}
