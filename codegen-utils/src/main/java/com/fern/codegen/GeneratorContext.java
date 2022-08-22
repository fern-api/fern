/*
 * (c) Copyright 2022 Birch Solutions Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.fern.codegen;

import com.fern.codegen.utils.ClassNameUtils;
import com.fern.codegen.utils.ImmutablesUtils;
import com.fern.codegen.utils.VisitorUtils;
import com.fern.types.ApiAuth;
import com.fern.types.DeclaredErrorName;
import com.fern.types.DeclaredTypeName;
import com.fern.types.ErrorDeclaration;
import com.fern.types.FernConstants;
import com.fern.types.IntermediateRepresentation;
import com.fern.types.TypeDeclaration;
import java.util.Map;

public final class GeneratorContext {

    private final ClassNameUtils classNameUtils;
    private final ImmutablesUtils immutablesUtils;
    private final VisitorUtils visitorUtils;
    private final Map<DeclaredTypeName, TypeDeclaration> typeDefinitionsByName;
    private final Map<DeclaredErrorName, ErrorDeclaration> errorDefinitionsByName;
    private final FernConstants fernConstants;
    private final ApiAuth apiAuth;
    private final IntermediateRepresentation ir;
    private final String organization;

    public GeneratorContext(
            IntermediateRepresentation ir,
            String organization,
            String packagePrefix,
            Map<DeclaredTypeName, TypeDeclaration> typeDefinitionsByName,
            Map<DeclaredErrorName, ErrorDeclaration> errorDefinitionsByName,
            ApiAuth apiAuth,
            FernConstants fernConstants) {
        this.ir = ir;
        this.classNameUtils = new ClassNameUtils(packagePrefix);
        this.immutablesUtils = new ImmutablesUtils();
        this.visitorUtils = new VisitorUtils();
        this.typeDefinitionsByName = typeDefinitionsByName;
        this.errorDefinitionsByName = errorDefinitionsByName;
        this.apiAuth = apiAuth;
        this.fernConstants = fernConstants;
        this.organization = organization;
    }

    public FernConstants getFernConstants() {
        return fernConstants;
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

    public Map<DeclaredErrorName, ErrorDeclaration> getErrorDefinitionsByName() {
        return errorDefinitionsByName;
    }

    public VisitorUtils getVisitorUtils() {
        return visitorUtils;
    }

    public ApiAuth getApiAuth() {
        return apiAuth;
    }

    public IntermediateRepresentation getIr() {
        return ir;
    }

    public String getOrganization() {
        return organization;
    }
}
