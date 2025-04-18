package com.fern.java.generators.auth;

import com.fern.ir.model.auth.HeaderAuthScheme;
import com.fern.ir.model.types.AliasTypeDeclaration;
import com.fern.ir.model.types.PrimitiveType;
import com.fern.ir.model.types.PrimitiveTypeV1;
import com.fern.ir.model.types.ResolvedTypeReference;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.generators.AliasGenerator;
import com.fern.java.output.GeneratedJavaFile;
import java.util.Set;

public final class HeaderAuthGenerator extends AbstractFileGenerator {
    private final HeaderAuthScheme headerAuthScheme;

    public HeaderAuthGenerator(AbstractGeneratorContext<?, ?> generatorContext, HeaderAuthScheme headerAuthScheme) {
        super(
                generatorContext
                        .getPoetClassNameFactory()
                        .getCoreClassName(headerAuthScheme
                                .getName()
                                .getName()
                                .getPascalCase()
                                .getSafeName()),
                generatorContext);
        this.headerAuthScheme = headerAuthScheme;
    }

    @Override
    public GeneratedJavaFile generateFile() {
        // TODO(dsinghvi): Fix resolved type
        AliasTypeDeclaration aliasTypeDeclaration = AliasTypeDeclaration.builder()
                .aliasOf(headerAuthScheme.getValueType())
                .resolvedType(ResolvedTypeReference.primitive(
                        PrimitiveType.builder().v1(PrimitiveTypeV1.STRING).build()))
                .build();
        AliasGenerator aliasGenerator = new AliasGenerator(
                className, generatorContext, aliasTypeDeclaration, Set.of(className.simpleName()), true);
        return aliasGenerator.generateFile();
    }
}
