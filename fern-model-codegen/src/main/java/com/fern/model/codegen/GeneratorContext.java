package com.fern.model.codegen;

import com.fern.NamedTypeReference;
import com.fern.TypeDefinition;
import com.fern.model.codegen.config.PluginConfig;
import com.fern.model.codegen.utils.ClassNameUtils;
import com.fern.model.codegen.utils.FilepathUtils;
import com.fern.model.codegen.utils.ImmutablesUtils;
import com.fern.model.codegen.utils.KeyWordUtils;
import com.fern.model.codegen.utils.TypeReferenceUtils;
import com.fern.model.codegen.utils.VisitorUtils;
import java.util.Map;

public final class GeneratorContext {

    private final PluginConfig pluginConfig;
    private final ClassNameUtils classNameUtils;
    private final FilepathUtils filepathUtils;
    private final ImmutablesUtils immutablesUtils;
    private final KeyWordUtils keyWordUtils;
    private final TypeReferenceUtils typeReferenceUtils;
    private final VisitorUtils visitorUtils;
    private final Map<NamedTypeReference, TypeDefinition> typeDefinitionsByName;

    public GeneratorContext(PluginConfig pluginConfig, Map<NamedTypeReference, TypeDefinition> typeDefinitionsByName) {
        this.pluginConfig = pluginConfig;
        this.filepathUtils = new FilepathUtils(pluginConfig);
        this.classNameUtils = new ClassNameUtils(filepathUtils);
        this.typeReferenceUtils = new TypeReferenceUtils(classNameUtils);
        this.immutablesUtils = new ImmutablesUtils(filepathUtils, typeReferenceUtils);
        this.keyWordUtils = new KeyWordUtils();
        this.visitorUtils = new VisitorUtils();
        this.typeDefinitionsByName = typeDefinitionsByName;
    }

    public ClassNameUtils getClassNameUtils() {
        return classNameUtils;
    }

    public FilepathUtils getFilepathUtils() {
        return filepathUtils;
    }

    public ImmutablesUtils getImmutablesUtils() {
        return immutablesUtils;
    }

    public KeyWordUtils getKeyWordUtils() {
        return keyWordUtils;
    }

    public Map<NamedTypeReference, TypeDefinition> getTypeDefinitionsByName() {
        return typeDefinitionsByName;
    }

    public TypeReferenceUtils getTypeReferenceUtils() {
        return typeReferenceUtils;
    }

    public VisitorUtils getVisitorUtils() {
        return visitorUtils;
    }
}
