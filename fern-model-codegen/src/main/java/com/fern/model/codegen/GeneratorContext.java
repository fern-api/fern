package com.fern.model.codegen;

import com.fern.NamedType;
import com.fern.TypeDefinition;
import com.fern.codegen.utils.ClassNameUtils;
import com.fern.model.codegen.config.PluginConfig;
import com.fern.model.codegen.utils.ImmutablesUtils;
import com.fern.model.codegen.utils.VisitorUtils;
import java.util.Map;

public final class GeneratorContext {

    private final ClassNameUtils classNameUtils;
    private final ImmutablesUtils immutablesUtils;
    private final VisitorUtils visitorUtils;
    private final Map<NamedType, TypeDefinition> typeDefinitionsByName;

    public GeneratorContext(PluginConfig pluginConfig, Map<NamedType, TypeDefinition> typeDefinitionsByName) {
        this.classNameUtils = new ClassNameUtils(pluginConfig.packagePrefix());
        this.immutablesUtils = new ImmutablesUtils(classNameUtils);
        this.visitorUtils = new VisitorUtils();
        this.typeDefinitionsByName = typeDefinitionsByName;
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
}
