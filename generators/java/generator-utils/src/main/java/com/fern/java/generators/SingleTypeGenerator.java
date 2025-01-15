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
import com.fern.java.output.GeneratedJavaInterface;
import com.squareup.javapoet.ClassName;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

public final class SingleTypeGenerator implements Type.Visitor<Optional<AbstractTypeGenerator>> {

    private final AbstractGeneratorContext<?, ?> generatorContext;
    private final DeclaredTypeName declaredTypeName;
    private final ClassName className;
    private final Map<TypeId, GeneratedJavaInterface> allGeneratedInterfaces;
    private final boolean fromErrorDeclaration;
    private final Set<String> reservedTypeNamesInScope;
    private final boolean isTopLevelClass;

    public SingleTypeGenerator(
            AbstractGeneratorContext<?, ?> generatorContext,
            DeclaredTypeName declaredTypeName,
            ClassName className,
            Map<TypeId, GeneratedJavaInterface> allGeneratedInterfaces,
            boolean fromErrorDeclaration,
            Set<String> reservedTypeNamesInScope,
            boolean isTopLevelClass) {
        this.generatorContext = generatorContext;
        this.className = className;
        this.allGeneratedInterfaces = allGeneratedInterfaces;
        this.declaredTypeName = declaredTypeName;
        this.fromErrorDeclaration = fromErrorDeclaration;
        this.reservedTypeNamesInScope = reservedTypeNamesInScope;
        this.isTopLevelClass = isTopLevelClass;
    }

    @Override
    public Optional<AbstractTypeGenerator> visitAlias(AliasTypeDeclaration value) {
        if (generatorContext.getCustomConfig().wrappedAliases() || fromErrorDeclaration) {
            AliasGenerator aliasGenerator =
                    new AliasGenerator(className, generatorContext, value, reservedTypeNamesInScope, isTopLevelClass);
            return Optional.of(aliasGenerator);
        }
        return Optional.empty();
    }

    @Override
    public Optional<AbstractTypeGenerator> visitEnum(EnumTypeDeclaration value) {
        EnumGenerator forwardCompatibleEnumGenerator =
                new EnumGenerator(className, generatorContext, value, reservedTypeNamesInScope, isTopLevelClass);
        return Optional.of(forwardCompatibleEnumGenerator);
    }

    @Override
    public Optional<AbstractTypeGenerator> visitObject(ObjectTypeDeclaration value) {
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
                className,
                reservedTypeNamesInScope,
                isTopLevelClass);
        return Optional.of(objectGenerator);
    }

    @Override
    public Optional<AbstractTypeGenerator> visitUnion(UnionTypeDeclaration value) {
        UnionGenerator unionGenerator =
                new UnionGenerator(className, generatorContext, value, reservedTypeNamesInScope, isTopLevelClass);
        return Optional.of(unionGenerator);
    }

    @Override
    public Optional<AbstractTypeGenerator> visitUndiscriminatedUnion(
            UndiscriminatedUnionTypeDeclaration undiscriminatedUnion) {
        UndiscriminatedUnionGenerator unionGenerator = new UndiscriminatedUnionGenerator(
                className, generatorContext, undiscriminatedUnion, reservedTypeNamesInScope, isTopLevelClass);
        return Optional.of(unionGenerator);
    }

    @Override
    public Optional<AbstractTypeGenerator> _visitUnknown(Object unknown) {
        throw new RuntimeException("Encountered unknown type: " + unknown);
    }
}
