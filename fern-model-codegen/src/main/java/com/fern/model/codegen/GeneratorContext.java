package com.fern.model.codegen;

import com.fern.NamedType;
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

    private final ClassNameUtils classNameUtils;
    private final FilepathUtils filepathUtils;
    private final ImmutablesUtils immutablesUtils;
    private final KeyWordUtils keyWordUtils;
    private final TypeReferenceUtils typeReferenceUtils;
    private final VisitorUtils visitorUtils;
    private final Map<NamedType, TypeDefinition> typeDefinitionsByName;

    public GeneratorContext(PluginConfig pluginConfig, Map<NamedType, TypeDefinition> typeDefinitionsByName) {
        this.filepathUtils = new FilepathUtils(pluginConfig);
        this.keyWordUtils = new KeyWordUtils();
        this.classNameUtils = new ClassNameUtils(filepathUtils, keyWordUtils);
        this.typeReferenceUtils = new TypeReferenceUtils(classNameUtils);
        this.immutablesUtils = new ImmutablesUtils(filepathUtils, typeReferenceUtils);
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

    public Map<NamedType, TypeDefinition> getTypeDefinitionsByName() {
        return typeDefinitionsByName;
    }

    public TypeReferenceUtils getTypeReferenceUtils() {
        return typeReferenceUtils;
    }

    public VisitorUtils getVisitorUtils() {
        return visitorUtils;
    }
}
