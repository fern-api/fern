package com.fern.java.client.generators;

import com.fern.ir.model.commons.FernFilepath;
import com.fern.ir.model.commons.Name;
import com.fern.ir.model.commons.SafeAndUnsafeString;
import com.fern.ir.model.commons.TypeId;
import com.fern.ir.model.http.QueryParameter;
import com.fern.ir.model.types.ContainerType;
import com.fern.ir.model.types.DeclaredTypeName;
import com.fern.ir.model.types.NamedType;
import com.fern.ir.model.types.Type;
import com.fern.ir.model.types.TypeDeclaration;
import com.fern.ir.model.types.TypeReference;
import com.fern.ir.model.types.UndiscriminatedUnionMember;
import com.fern.ir.model.types.UndiscriminatedUnionTypeDeclaration;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.generators.UndiscriminatedUnionGenerator;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.utils.KeyWordUtils;
import com.squareup.javapoet.ClassName;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

public class ExplodedQueryParameterGenerator {

    private final QueryParameter queryParameter;
    private final AbstractGeneratorContext<?, ?> generatorContext;
    private final FernFilepath fernFilepath;
    private final ClassName className;
    private final String prefix;
    private final TypeId typeId;

    public ExplodedQueryParameterGenerator(
            AbstractGeneratorContext<?, ?> generatorContext,
            ClassName wrappedRequestClassName,
            QueryParameter queryParameter) {
        this.queryParameter = queryParameter;
        this.generatorContext = generatorContext;
        this.fernFilepath =
                fernFilepath(wrappedRequestClassName, queryParameter.getName().getName());
        this.className =
                className(wrappedRequestClassName, queryParameter.getName().getName());
        this.prefix = queryParameter.getName().getName().getPascalCase().getUnsafeName();
        this.typeId = TypeId.of(UUID.randomUUID() + "_" + this.prefix);
    }

    public GeneratedJavaFile generate() {
        UndiscriminatedUnionTypeDeclaration singleOrListDeclaration = singleOrListDeclaration(queryParameter);
        UndiscriminatedUnionGenerator generator = generator(singleOrListDeclaration);
        return generator.generateFile();
    }

    public TypeReference asValueType() {
        return TypeReference.named(NamedType.builder()
                .typeId(typeId)
                .fernFilepath(fernFilepath)
                .name(queryParameter.getName().getName())
                .default_(Optional.empty())
                .inline(false)
                .build());
    }

    private UndiscriminatedUnionGenerator generator(UndiscriminatedUnionTypeDeclaration declaration) {
        return new UndiscriminatedUnionGenerator(
                className, generatorContext, declaration, Set.of(className.simpleName()), true, prefix);
    }

    private UndiscriminatedUnionTypeDeclaration singleOrListDeclaration(QueryParameter queryParameter) {
        UndiscriminatedUnionMember single = UndiscriminatedUnionMember.builder()
                .type(queryParameter.getValueType())
                .build();

        UndiscriminatedUnionMember list = UndiscriminatedUnionMember.builder()
                .type(TypeReference.container(ContainerType.list(queryParameter.getValueType())))
                .build();

        UndiscriminatedUnionTypeDeclaration declaration = UndiscriminatedUnionTypeDeclaration.builder()
                .addMembers(single)
                .addMembers(list)
                .build();

        // NOTE: This is needed because create an object is currently reliant on fetching type declarations from the IR.
        //   In the long run, we should make dynamic type declarations such as this one available to reference without
        //   having to mutate the context like this.
        generatorContext
                .getTypeDeclarations()
                .put(
                        typeId,
                        TypeDeclaration.builder()
                                .name(DeclaredTypeName.builder()
                                        .typeId(typeId)
                                        .fernFilepath(fernFilepath)
                                        .name(queryParameter.getName().getName())
                                        .build())
                                .shape(Type.undiscriminatedUnion(declaration))
                                .build());

        return declaration;
    }

    private static ClassName className(ClassName wrappedRequestClassName, Name name) {
        return ClassName.get(
                wrappedRequestClassName.packageName(), name.getPascalCase().getUnsafeName());
    }

    private static FernFilepath fernFilepath(ClassName wrappedRequestClassName, Name name) {
        List<Name> packagePath = Arrays.stream(
                        wrappedRequestClassName.packageName().split("\\."))
                .map(ExplodedQueryParameterGenerator::asName)
                .collect(Collectors.toList());
        List<Name> allParts = new ArrayList<>();
        allParts.addAll(packagePath);
        allParts.add(name);
        return FernFilepath.builder()
                .allParts(allParts)
                .packagePath(packagePath)
                .file(name)
                .build();
    }

    private static Name asName(String name) {
        return Name.builder()
                .originalName(name)
                .camelCase(asSafeAndUnsafe(name))
                .pascalCase(asSafeAndUnsafe(name))
                .snakeCase(asSafeAndUnsafe(name))
                .screamingSnakeCase(asSafeAndUnsafe(name))
                .build();
    }

    private static SafeAndUnsafeString asSafeAndUnsafe(String name) {
        return SafeAndUnsafeString.builder()
                .unsafeName(name)
                .safeName(KeyWordUtils.getKeyWordCompatibleName(name))
                .build();
    }
}
