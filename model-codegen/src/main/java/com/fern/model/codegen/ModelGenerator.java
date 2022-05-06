package com.fern.model.codegen;

import com.fern.codegen.GeneratedAlias;
import com.fern.codegen.GeneratedEnum;
import com.fern.codegen.GeneratedInterface;
import com.fern.codegen.GeneratedObject;
import com.fern.codegen.GeneratedUnion;
import com.fern.codegen.GeneratorContext;
import com.fern.codegen.utils.ClassNameUtils.PackageType;
import com.types.AliasTypeDefinition;
import com.types.EnumTypeDefinition;
import com.types.NamedType;
import com.types.ObjectTypeDefinition;
import com.types.Type;
import com.types.TypeDefinition;
import com.types.UnionTypeDefinition;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class ModelGenerator {

    private static final Logger log = LoggerFactory.getLogger(ModelGenerator.class);

    private final List<TypeDefinition> typeDefinitions;
    private final Map<NamedType, TypeDefinition> typeDefinitionsByName;
    private final GeneratorContext generatorContext;

    public ModelGenerator(List<TypeDefinition> typeDefinitions, GeneratorContext generatorContext) {
        this.typeDefinitions = typeDefinitions;
        this.typeDefinitionsByName = generatorContext.getTypeDefinitionsByName();
        this.generatorContext = generatorContext;
    }

    public ModelGeneratorResult generate() {
        ModelGeneratorResult.Builder modelGeneratorResultBuilder = ModelGeneratorResult.builder();
        Map<NamedType, GeneratedInterface> generatedInterfaces = getGeneratedInterfaces();
        modelGeneratorResultBuilder.putAllInterfaces(generatedInterfaces);
        typeDefinitions.forEach(typeDefinition -> typeDefinition
                .shape()
                .accept(new TypeDefinitionGenerator(typeDefinition, generatedInterfaces, modelGeneratorResultBuilder)));
        return modelGeneratorResultBuilder.build();
    }

    private Map<NamedType, GeneratedInterface> getGeneratedInterfaces() {
        Set<NamedType> interfaceCandidates = typeDefinitions.stream()
                .map(TypeDefinition::shape)
                .map(Type::getObject)
                .flatMap(Optional::stream)
                .map(ObjectTypeDefinition::_extends)
                .flatMap(List::stream)
                .collect(Collectors.toSet());
        return interfaceCandidates.stream().collect(Collectors.toMap(Function.identity(), namedType -> {
            TypeDefinition typeDefinition = typeDefinitionsByName.get(namedType);
            ObjectTypeDefinition objectTypeDefinition = typeDefinition
                    .shape()
                    .getObject()
                    .orElseThrow(() -> new IllegalStateException("Non-objects cannot be extended. Fix type "
                            + typeDefinition.name().name() + " located in file"
                            + typeDefinition.name().fernFilepath()));
            InterfaceGenerator interfaceGenerator =
                    new InterfaceGenerator(objectTypeDefinition, namedType, generatorContext);
            return interfaceGenerator.generate();
        }));
    }

    private final class TypeDefinitionGenerator implements Type.Visitor<Void> {

        private final TypeDefinition typeDefinition;
        private final Map<NamedType, GeneratedInterface> generatedInterfaces;
        private final ModelGeneratorResult.Builder modelGeneratorResultBuilder;

        TypeDefinitionGenerator(
                TypeDefinition typeDefinition,
                Map<NamedType, GeneratedInterface> generatedInterfaces,
                ModelGeneratorResult.Builder modelGeneratorResultBuilder) {
            this.typeDefinition = typeDefinition;
            this.generatedInterfaces = generatedInterfaces;
            this.modelGeneratorResultBuilder = modelGeneratorResultBuilder;
        }

        @Override
        public Void visitObject(ObjectTypeDefinition objectTypeDefinition) {
            Optional<GeneratedInterface> selfInterface =
                    Optional.ofNullable(generatedInterfaces.get(typeDefinition.name()));
            List<GeneratedInterface> extendedInterfaces = objectTypeDefinition._extends().stream()
                    .map(generatedInterfaces::get)
                    .sorted(Comparator.comparing(
                            generatedInterface -> generatedInterface.className().simpleName()))
                    .collect(Collectors.toList());
            ObjectGenerator objectGenerator = new ObjectGenerator(
                    typeDefinition.name(),
                    PackageType.TYPES,
                    objectTypeDefinition,
                    extendedInterfaces,
                    selfInterface,
                    generatorContext);
            GeneratedObject generatedObject = objectGenerator.generate();
            modelGeneratorResultBuilder.addObjects(generatedObject);
            return null;
        }

        @Override
        public Void visitUnion(UnionTypeDefinition unionTypeDefinition) {
            UnionGenerator unionGenerator =
                    new UnionGenerator(typeDefinition.name(), PackageType.TYPES, unionTypeDefinition, generatorContext);
            GeneratedUnion generatedUnion = unionGenerator.generate();
            modelGeneratorResultBuilder.addUnions(generatedUnion);
            return null;
        }

        @Override
        public Void visitAlias(AliasTypeDefinition aliasTypeDefinition) {
            AliasGenerator aliasGenerator =
                    new AliasGenerator(aliasTypeDefinition, PackageType.TYPES, typeDefinition.name(), generatorContext);
            GeneratedAlias generatedAlias = aliasGenerator.generate();
            modelGeneratorResultBuilder.addAliases(generatedAlias);
            return null;
        }

        @Override
        public Void visitEnum(EnumTypeDefinition enumTypeDefinition) {
            EnumGenerator enumGenerator =
                    new EnumGenerator(typeDefinition.name(), PackageType.TYPES, enumTypeDefinition, generatorContext);
            GeneratedEnum generatedEnum = enumGenerator.generate();
            modelGeneratorResultBuilder.addEnums(generatedEnum);
            return null;
        }

        @Override
        public Void visitUnknown(String unknownType) {
            throw new RuntimeException("Encountered unknown Type: " + unknownType);
        }
    }
}
