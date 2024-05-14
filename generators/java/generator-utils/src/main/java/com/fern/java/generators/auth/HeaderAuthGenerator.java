package com.fern.java.generators.auth;

import com.fern.irV42.model.auth.HeaderAuthScheme;
import com.fern.irV42.model.types.AliasTypeDeclaration;
import com.fern.irV42.model.types.PrimitiveType;
import com.fern.irV42.model.types.ResolvedTypeReference;
import com.fern.java.AbstractGeneratorContext;
import com.fern.java.generators.AbstractFileGenerator;
import com.fern.java.generators.AliasGenerator;
import com.fern.java.output.GeneratedJavaFile;

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
                .resolvedType(ResolvedTypeReference.primitive(PrimitiveType.STRING))
                .build();
        AliasGenerator aliasGenerator = new AliasGenerator(className, generatorContext, aliasTypeDeclaration, false);
        return aliasGenerator.generateFile();
    }
}
