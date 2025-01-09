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
import com.fern.java.output.GeneratedJavaInterface;
import com.squareup.javapoet.ClassName;
import com.squareup.javapoet.TypeSpec;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

public class SingleTypeSpecGenerator implements Type.Visitor<Optional<TypeSpec>> {

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
    public Optional<TypeSpec> visitAlias(AliasTypeDeclaration value) {
        return Optional.empty();
    }

    @Override
    public Optional<TypeSpec> visitEnum(EnumTypeDeclaration value) {
        return Optional.empty();
    }

    @Override
    public Optional<TypeSpec> visitObject(ObjectTypeDeclaration value) {
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
        return Optional.of(objectTypeSpecGenerator.generate());
    }

    @Override
    public Optional<TypeSpec> visitUnion(UnionTypeDeclaration value) {
        return Optional.empty();
    }

    @Override
    public Optional<TypeSpec> visitUndiscriminatedUnion(UndiscriminatedUnionTypeDeclaration undiscriminatedUnion) {
        return Optional.empty();
    }

    @Override
    public Optional<TypeSpec> _visitUnknown(Object o) {
        return Optional.empty();
    }
}
