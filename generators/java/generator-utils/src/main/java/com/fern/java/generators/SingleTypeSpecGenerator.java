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
import com.squareup.javapoet.TypeSpec;
import java.util.Map;
import java.util.Optional;

public final class SingleTypeSpecGenerator implements Type.Visitor<Optional<TypeSpec>> {

    private final AbstractGeneratorContext<?, ?> generatorContext;
    private final DeclaredTypeName declaredTypeName;
    private final ClassName className;
    private final Map<TypeId, GeneratedJavaInterface> allGeneratedInterfaces;
    private final boolean fromErrorDeclaration;

    public SingleTypeSpecGenerator(
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
    }

    @Override
    public Optional<TypeSpec> visitAlias(AliasTypeDeclaration aliasTypeDeclaration) {
        return Optional.empty();
    }

    @Override
    public Optional<TypeSpec> visitEnum(EnumTypeDeclaration enumTypeDeclaration) {
        return Optional.empty();
    }

    @Override
    public Optional<TypeSpec> visitObject(ObjectTypeDeclaration objectTypeDeclaration) {
        return Optional.empty();
    }

    @Override
    public Optional<TypeSpec> visitUnion(UnionTypeDeclaration unionTypeDeclaration) {
        return Optional.empty();
    }

    @Override
    public Optional<TypeSpec> visitUndiscriminatedUnion(
            UndiscriminatedUnionTypeDeclaration undiscriminatedUnionTypeDeclaration) {
        return Optional.empty();
    }

    @Override
    public Optional<TypeSpec> _visitUnknown(Object o) {
        return Optional.empty();
    }
}
