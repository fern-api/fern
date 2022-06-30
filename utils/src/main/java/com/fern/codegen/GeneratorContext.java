package com.fern.codegen;

import com.fern.codegen.stateless.generator.ApiExceptionGenerator;
import com.fern.codegen.stateless.generator.AuthHeaderGenerator;
import com.fern.codegen.stateless.generator.ImmutablesStyleGenerator;
import com.fern.codegen.stateless.generator.ObjectMapperGenerator;
import com.fern.codegen.utils.ClassNameUtils;
import com.fern.codegen.utils.ImmutablesUtils;
import com.fern.codegen.utils.VisitorUtils;
import com.fern.types.errors.ErrorDeclaration;
import com.fern.types.errors.ErrorName;
import com.fern.types.types.DeclaredTypeName;
import com.fern.types.types.TypeDeclaration;
import java.util.Map;
import java.util.Optional;

public final class GeneratorContext {

    private final ClassNameUtils classNameUtils;
    private final ImmutablesUtils immutablesUtils;
    private final VisitorUtils visitorUtils;
    private final Map<DeclaredTypeName, TypeDeclaration> typeDefinitionsByName;
    private final Map<ErrorName, ErrorDeclaration> errorDefinitionsByName;
    private final GeneratedFile stagedImmutablesFile;
    private final GeneratedFile clientObjectMappersFile;
    private final GeneratedFile serverObjectMappersFile;
    private final GeneratedFile packagePrivateImmutablesFile;
    private final GeneratedFile authHeaderFile;
    private final GeneratedFile apiExceptionFile;
    private final GeneratedFile httpApiExceptionFile;
    private final GeneratedFile unknownRemoteExceptionFile;
    private final GeneratedFile aliasImmutablesStyle;

    public GeneratorContext(
            Optional<String> packagePrefix,
            Map<DeclaredTypeName, TypeDeclaration> typeDefinitionsByName,
            Map<ErrorName, ErrorDeclaration> errorDefinitionsByName) {
        this.classNameUtils = new ClassNameUtils(packagePrefix);
        this.immutablesUtils = new ImmutablesUtils(classNameUtils);
        this.visitorUtils = new VisitorUtils();
        this.typeDefinitionsByName = typeDefinitionsByName;
        this.errorDefinitionsByName = errorDefinitionsByName;
        this.stagedImmutablesFile = ImmutablesStyleGenerator.generateStagedBuilderImmutablesStyle(classNameUtils);
        this.packagePrivateImmutablesFile =
                ImmutablesStyleGenerator.generatePackagePrivateImmutablesStyle(classNameUtils);
        this.aliasImmutablesStyle = ImmutablesStyleGenerator.generateAliasImmutablesStyle(classNameUtils);
        this.clientObjectMappersFile = ObjectMapperGenerator.generateClientObjectMappersClass(classNameUtils);
        this.serverObjectMappersFile = ObjectMapperGenerator.generateServerObjectMappersClass(classNameUtils);
        this.authHeaderFile = AuthHeaderGenerator.generateAuthHeaderClass(
                classNameUtils, immutablesUtils, packagePrivateImmutablesFile.className());
        this.apiExceptionFile = ApiExceptionGenerator.generateApiExceptionInterface(classNameUtils);
        this.httpApiExceptionFile = ApiExceptionGenerator.generateHttpApiExceptionInterface(classNameUtils);
        this.unknownRemoteExceptionFile = ApiExceptionGenerator.generateUnknownRemoteException(classNameUtils);
    }

    public ClassNameUtils getClassNameUtils() {
        return classNameUtils;
    }

    public ImmutablesUtils getImmutablesUtils() {
        return immutablesUtils;
    }

    public Map<DeclaredTypeName, TypeDeclaration> getTypeDefinitionsByName() {
        return typeDefinitionsByName;
    }

    public Map<ErrorName, ErrorDeclaration> getErrorDefinitionsByName() {
        return errorDefinitionsByName;
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

    public GeneratedFile getServerObjectMappersFile() {
        return serverObjectMappersFile;
    }

    public GeneratedFile getPackagePrivateImmutablesFile() {
        return packagePrivateImmutablesFile;
    }

    public GeneratedFile getAliasImmutablesStyle() {
        return aliasImmutablesStyle;
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

    public GeneratedFile getUnknownRemoteExceptionFile() {
        return unknownRemoteExceptionFile;
    }
}
