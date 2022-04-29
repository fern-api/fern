package com.fern.codegen;

import com.fern.codegen.stateless.generator.ApiExceptionGenerator;
import com.fern.codegen.stateless.generator.AuthHeaderGenerator;
import com.fern.codegen.stateless.generator.ClientObjectMapperGenerator;
import com.fern.codegen.stateless.generator.ImmutablesStyleGenerator;
import com.fern.codegen.utils.ClassNameUtils;
import com.fern.codegen.utils.ImmutablesUtils;
import com.fern.codegen.utils.VisitorUtils;
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
    private final GeneratedFile clientObjectMappersFile;
    private final GeneratedFile packagePrivateImmutablesFile;
    private final GeneratedFile authHeaderFile;
    private final GeneratedFile apiExceptionFile;
    private final GeneratedFile httpApiExceptionFile;

    public GeneratorContext(Optional<String> packagePrefix, Map<NamedType, TypeDefinition> typeDefinitionsByName) {
        this.classNameUtils = new ClassNameUtils(packagePrefix);
        this.immutablesUtils = new ImmutablesUtils(classNameUtils);
        this.visitorUtils = new VisitorUtils();
        this.typeDefinitionsByName = typeDefinitionsByName;
        this.stagedImmutablesFile = ImmutablesStyleGenerator.generateStagedBuilderImmutablesStyle(classNameUtils);
        this.packagePrivateImmutablesFile =
                ImmutablesStyleGenerator.generatePackagePrivateImmutablesStyle(classNameUtils);
        this.clientObjectMappersFile = ClientObjectMapperGenerator.generateObjectMappersClass(classNameUtils);
        this.authHeaderFile = AuthHeaderGenerator.generateAuthHeaderClass(
                classNameUtils, immutablesUtils, packagePrivateImmutablesFile.className());
        this.apiExceptionFile = ApiExceptionGenerator.generateApiExceptionInterface(classNameUtils);
        this.httpApiExceptionFile = ApiExceptionGenerator.generateHttpApiExceptionInterface(classNameUtils);
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

    public GeneratedFile getClientObjectMappersFile() {
        return clientObjectMappersFile;
    }

    public GeneratedFile getPackagePrivateImmutablesFile() {
        return packagePrivateImmutablesFile;
    }

    public GeneratedFile getAuthHeaderFile() {
        return authHeaderFile;
    }

    public GeneratedFile getApiExceptionFile() {
        return apiExceptionFile;
    }

    public GeneratedFile getHttpApiExceptionFile() {
        return httpApiExceptionFile;
    }
}
