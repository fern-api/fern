package com.fern.codegen;

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

    public GeneratorContext(
            Optional<String> packagePrefix,
            Map<DeclaredTypeName, TypeDeclaration> typeDefinitionsByName,
            Map<ErrorName, ErrorDeclaration> errorDefinitionsByName) {
        this.classNameUtils = new ClassNameUtils(packagePrefix);
        this.immutablesUtils = new ImmutablesUtils(classNameUtils);
        this.visitorUtils = new VisitorUtils();
        this.typeDefinitionsByName = typeDefinitionsByName;
        this.errorDefinitionsByName = errorDefinitionsByName;
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
}
