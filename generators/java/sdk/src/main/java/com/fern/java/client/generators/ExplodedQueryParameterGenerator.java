package com.fern.java.client.generators;

import com.fern.ir.model.commons.Name;
import com.fern.ir.model.commons.TypeId;
import com.fern.ir.model.http.HttpService;
import com.fern.ir.model.http.QueryParameter;
import com.fern.ir.model.types.ContainerType;
import com.fern.ir.model.types.DeclaredTypeName;
import com.fern.ir.model.types.NamedType;
import com.fern.ir.model.types.Type;
import com.fern.ir.model.types.TypeDeclaration;
import com.fern.ir.model.types.TypeReference;
import com.fern.ir.model.types.UndiscriminatedUnionMember;
import com.fern.ir.model.types.UndiscriminatedUnionTypeDeclaration;
import com.fern.java.client.ClientGeneratorContext;
import com.fern.java.generators.UndiscriminatedUnionGenerator;
import com.fern.java.output.GeneratedJavaFile;
import com.fern.java.utils.NameUtils;
import com.squareup.javapoet.ClassName;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public class ExplodedQueryParameterGenerator {

    private final QueryParameter queryParameter;
    private final ClientGeneratorContext generatorContext;
    private final ClassName className;
    private final String prefix;
    private final DeclaredTypeName declaredTypeName;

    public ExplodedQueryParameterGenerator(
            ClientGeneratorContext generatorContext,
            HttpService httpService,
            Name wrapperName,
            QueryParameter queryParameter) {
        this.queryParameter = queryParameter;
        this.generatorContext = generatorContext;
        this.prefix = queryParameter.getName().getName().getPascalCase().getUnsafeName();
        this.declaredTypeName = DeclaredTypeName.builder()
                .typeId(TypeId.of(UUID.randomUUID() + "_" + this.prefix))
                .fernFilepath(httpService.getName().getFernFilepath())
                .name(NameUtils.concat(wrapperName, queryParameter.getName().getName()))
                .build();
        this.className = generatorContext.getPoetClassNameFactory().getTypeClassName(this.declaredTypeName);
    }

    public GeneratedJavaFile generate() {
        UndiscriminatedUnionTypeDeclaration singleOrListDeclaration = singleOrListDeclaration(queryParameter);
        UndiscriminatedUnionGenerator generator = generator(singleOrListDeclaration);
        return generator.generateFile();
    }

    public TypeReference asValueType() {
        return TypeReference.named(NamedType.builder()
                .typeId(declaredTypeName.getTypeId())
                .fernFilepath(declaredTypeName.getFernFilepath())
                .name(declaredTypeName.getName())
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
                        declaredTypeName.getTypeId(),
                        TypeDeclaration.builder()
                                .name(declaredTypeName)
                                .shape(Type.undiscriminatedUnion(declaration))
                                .build());

        return declaration;
    }
}
