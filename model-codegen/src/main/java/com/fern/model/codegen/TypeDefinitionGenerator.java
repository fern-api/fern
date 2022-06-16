package com.fern.model.codegen;

import com.fern.codegen.GeneratedInterface;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.IGeneratedFile;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.fern.model.codegen.types.AliasGenerator;
import com.fern.model.codegen.types.EnumGenerator;
import com.fern.model.codegen.types.ObjectGenerator;
import com.fern.model.codegen.types.UnionGenerator;
import com.fern.types.types.AliasTypeDefinition;
import com.fern.types.types.EnumTypeDefinition;
import com.fern.types.types.NamedType;
import com.fern.types.types.ObjectTypeDefinition;
import com.fern.types.types.Type;
import com.fern.types.types.TypeDefinition;
import com.fern.types.types.UnionTypeDefinition;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

public final class TypeDefinitionGenerator implements Type.Visitor<IGeneratedFile> {

    private final TypeDefinition typeDefinition;
    private final GeneratorContext generatorContext;
    private final Map<NamedType, GeneratedInterface> generatedInterfaces;
    private final PackageType packageType;

    public TypeDefinitionGenerator(
            TypeDefinition typeDefinition,
            GeneratorContext generatorContext,
            Map<NamedType, GeneratedInterface> generatedInterfaces,
            PackageType packageType) {
        this.typeDefinition = typeDefinition;
        this.generatorContext = generatorContext;
        this.generatedInterfaces = generatedInterfaces;
        this.packageType = packageType;
    }

    @Override
    public IGeneratedFile visitObject(ObjectTypeDefinition objectTypeDefinition) {
        Optional<GeneratedInterface> selfInterface =
                Optional.ofNullable(generatedInterfaces.get(typeDefinition.name()));
        List<GeneratedInterface> extendedInterfaces = objectTypeDefinition._extends().stream()
                .map(generatedInterfaces::get)
                .sorted(Comparator.comparing(
                        generatedInterface -> generatedInterface.className().simpleName()))
                .collect(Collectors.toList());
        ObjectGenerator objectGenerator = new ObjectGenerator(
                typeDefinition.name(),
                packageType,
                objectTypeDefinition,
                extendedInterfaces,
                selfInterface,
                generatorContext);
        return objectGenerator.generate();
    }

    @Override
    public IGeneratedFile visitUnion(UnionTypeDefinition unionTypeDefinition) {
        UnionGenerator unionGenerator =
                new UnionGenerator(typeDefinition.name(), packageType, unionTypeDefinition, generatorContext);
        return unionGenerator.generate();
    }

    @Override
    public IGeneratedFile visitAlias(AliasTypeDefinition aliasTypeDefinition) {
        AliasGenerator aliasGenerator =
                new AliasGenerator(aliasTypeDefinition, packageType, typeDefinition.name(), generatorContext);
        return aliasGenerator.generate();
    }

    @Override
    public IGeneratedFile visitEnum(EnumTypeDefinition enumTypeDefinition) {
        EnumGenerator enumGenerator =
                new EnumGenerator(typeDefinition.name(), packageType, enumTypeDefinition, generatorContext);
        return enumGenerator.generate();
    }

    @Override
    public IGeneratedFile visitUnknown(String unknownType) {
        throw new RuntimeException("Encountered unknown Type: " + unknownType);
    }
}
