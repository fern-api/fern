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
import com.fern.java.generators.object.ObjectTypeSpecGenerator;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.output.GeneratedJavaInterface;
import com.fern.java.output.GeneratedObject;
import com.squareup.javapoet.ClassName;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

public final class SingleTypeGenerator implements Type.Visitor<Optional<GeneratedJavaFile>> {

    private final AbstractGeneratorContext<?, ?> generatorContext;
    private final DeclaredTypeName declaredTypeName;
    private final ClassName className;
    private final Map<TypeId, GeneratedJavaInterface> allGeneratedInterfaces;
    private final boolean fromErrorDeclaration;
    private final SingleTypeSpecGenerator typeSpecGenerator;

    public SingleTypeGenerator(
            AbstractGeneratorContext<?, ?> generatorContext,
            DeclaredTypeName declaredTypeName,
            ClassName className,
            Map<TypeId, GeneratedJavaInterface> allGeneratedInterfaces,
            boolean fromErrorDeclaration) {
        this.generatorContext = generatorContext;
        this.className = className;
        this.allGeneratedInterfaces = allGeneratedInterfaces;
        this.declaredTypeName = declaredTypeName;
        this.fromErrorDeclaration = fromErrorDeclaration;
        this.typeSpecGenerator = new SingleTypeSpecGenerator(
                generatorContext, declaredTypeName, className, allGeneratedInterfaces, fromErrorDeclaration);
    }

    @Override
    public Optional<GeneratedJavaFile> visitAlias(AliasTypeDeclaration value) {
        if (generatorContext.getCustomConfig().wrappedAliases() || fromErrorDeclaration) {
            AliasGenerator aliasGenerator = new AliasGenerator(className, generatorContext, value);
            return Optional.of(aliasGenerator.generateFile());
        }
        return Optional.empty();
    }

    @Override
    public Optional<GeneratedJavaFile> visitEnum(EnumTypeDeclaration value) {
        EnumGenerator forwardCompatibleEnumGenerator = new EnumGenerator(className, generatorContext, value);
        return Optional.of(forwardCompatibleEnumGenerator.generateFile());
    }

    @Override
    public Optional<GeneratedJavaFile> visitObject(ObjectTypeDeclaration value) {
        List<GeneratedJavaInterface> extendedInterfaces = value.getExtends().stream()
                .map(DeclaredTypeName::getTypeId)
                .map(allGeneratedInterfaces::get)
                .collect(Collectors.toList());
        ObjectTypeSpecGenerator objectTypeSpecGenerator = new ObjectTypeSpecGenerator(
                value,
                Optional.ofNullable(allGeneratedInterfaces.get(declaredTypeName.getTypeId())),
                extendedInterfaces,
                generatorContext,
                allGeneratedInterfaces,
                className);
        ObjectGenerator objectGenerator = new ObjectGenerator(
                generatorContext,
                className,
                objectTypeSpecGenerator.generate(),
                objectTypeSpecGenerator.objectPropertyGetters(),
                objectTypeSpecGenerator.extendedPropertyGetters());
        GeneratedObject generatedObject = objectGenerator.generateFile();
        return Optional.of(GeneratedJavaFile.builder()
                .className(generatedObject.getClassName())
                .javaFile(generatedObject.javaFile())
                .build());
    }

    @Override
    public Optional<GeneratedJavaFile> visitUnion(UnionTypeDeclaration value) {
        UnionGenerator unionGenerator = new UnionGenerator(className, generatorContext, value);
        return Optional.of(unionGenerator.generateFile());
    }

    @Override
    public Optional<GeneratedJavaFile> visitUndiscriminatedUnion(
            UndiscriminatedUnionTypeDeclaration undiscriminatedUnion) {
        UndiscriminatedUnionGenerator unionGenerator =
                new UndiscriminatedUnionGenerator(className, generatorContext, undiscriminatedUnion);
        return Optional.of(unionGenerator.generateFile());
    }

    @Override
    public Optional<GeneratedJavaFile> _visitUnknown(Object unknown) {
        throw new RuntimeException("Encountered unknown type: " + unknown);
    }
}
