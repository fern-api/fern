package com.fern.model.codegen;

import com.fern.codegen.GeneratedFile;
import com.fern.codegen.utils.ClassNameUtils;
import com.fern.model.codegen.config.PluginConfig;
import com.fern.model.codegen.utils.ImmutablesUtils;
import com.fern.model.codegen.utils.VisitorUtils;
import com.squareup.javapoet.ClassName;
import com.types.NamedType;
import com.types.TypeDefinition;
import java.util.Map;

public final class GeneratorContext {

    private final ClassNameUtils classNameUtils;
    private final ImmutablesUtils immutablesUtils;
    private final VisitorUtils visitorUtils;
    private final Map<NamedType, TypeDefinition> typeDefinitionsByName;
    private final GeneratedFile stagedImmutablesFile;

    public GeneratorContext(PluginConfig pluginConfig, Map<NamedType, TypeDefinition> typeDefinitionsByName) {
        this.classNameUtils = new ClassNameUtils(pluginConfig.packagePrefix());
        this.immutablesUtils = new ImmutablesUtils(classNameUtils);
        this.visitorUtils = new VisitorUtils();
        this.typeDefinitionsByName = typeDefinitionsByName;
        this.stagedImmutablesFile = ImmutablesStyleGenerator.generateStagedBuilderImmutablesStyle(classNameUtils);
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
