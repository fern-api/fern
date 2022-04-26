package com.fern.codegen;

import com.fern.codegen.utils.ClassNameUtils;
import com.fern.codegen.utils.ImmutablesUtils;
import com.fern.codegen.utils.VisitorUtils;
import com.squareup.javapoet.ClassName;
import com.types.NamedType;
import com.types.TypeDefinition;
import java.util.Map;
import java.util.Optional;

public final class GeneratorContext {

    private final ClassNameUtils classNameUtils;
    private final ImmutablesUtils immutablesUtils;
    private final VisitorUtils visitorUtils;
    private final Map<NamedType, TypeDefinition> typeDefinitionsByName;
    private final GeneratedFile stagedImmutablesFile;

    public GeneratorContext(Optional<String> packagePrefix, Map<NamedType, TypeDefinition> typeDefinitionsByName) {
        this.classNameUtils = new ClassNameUtils(packagePrefix);
        this.immutablesUtils = new ImmutablesUtils(classNameUtils);
        this.visitorUtils = new VisitorUtils();
        this.typeDefinitionsByName = typeDefinitionsByName;
        this.stagedImmutablesFile = null;
        // this.stagedImmutablesFile = ImmutablesStyleGenerator.generateStagedBuilderImmutablesStyle(classNameUtils);
    }

    public ClassNameUtils getClassNameUtils() {
        return classNameUtils;
    }

    public ImmutablesUtils getImmutablesUtils() {
        return immutablesUtils;
    }

    public Map<NamedType, TypeDefinition> getTypeDefinitionsByName() {
        return typeDefinitionsByName;
    }

    public VisitorUtils getVisitorUtils() {
        return visitorUtils;
    }

    public GeneratedFile getStagedImmutablesFile() {
        return stagedImmutablesFile;
    }

    public ClassName getStagedImmutablesBuilderClassname() {
        return stagedImmutablesFile.className();
    }
}
