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

package com.fern.java.client;

import com.fern.ir.model.services.http.HttpEndpointId;
import com.fern.ir.model.services.http.HttpHeader;
import com.fern.ir.model.services.http.HttpRequest;
import com.fern.ir.model.services.http.PathParameter;
import com.fern.ir.model.services.http.QueryParameter;
import com.fern.java.immutables.StagedBuilderImmutablesStyle;
import com.fern.java.output.AbstractGeneratedJavaFile;
import com.squareup.javapoet.MethodSpec;
import com.squareup.javapoet.ParameterSpec;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.immutables.value.Value;

@Value.Immutable
@StagedBuilderImmutablesStyle
public abstract class GeneratedJerseyServiceInterface extends AbstractGeneratedJavaFile {

    public abstract Map<HttpEndpointId, GeneratedEndpointMethod> endpointMethods();

    public abstract Map<HttpEndpointId, AbstractGeneratedJavaFile> endpointExceptions();

    public abstract AbstractGeneratedJavaFile errorDecoder();

    public static ImmutableGeneratedJerseyServiceInterface.ClassNameBuildStage builder() {
        return ImmutableGeneratedJerseyServiceInterface.builder();
    }

    @Value.Immutable
    @StagedBuilderImmutablesStyle
    public abstract static class GeneratedEndpointMethod {

        public abstract MethodSpec methodSpec();

        public abstract List<EndpointParameter> parameters();

        public static ImmutableGeneratedEndpointMethod.MethodSpecBuildStage builder() {
            return ImmutableGeneratedEndpointMethod.builder();
        }
    }

    public interface EndpointParameter {

        ParameterSpec parameterSpec();

        Optional<String> docs();
    }

    @Value.Immutable
    @StagedBuilderImmutablesStyle
    public interface AuthEndpointParameter extends EndpointParameter {

        @Override
        default Optional<String> docs() {
            return Optional.empty();
        }

        static ImmutableAuthEndpointParameter.ParameterSpecBuildStage builder() {
            return ImmutableAuthEndpointParameter.builder();
        }
    }

    @Value.Immutable
    @StagedBuilderImmutablesStyle
    public interface EndpointHeaderParameter extends EndpointParameter {
        HttpHeader httpHeader();

        @Override
        default Optional<String> docs() {
            return httpHeader().getDocs();
        }

        static ImmutableEndpointHeaderParameter.ParameterSpecBuildStage builder() {
            return ImmutableEndpointHeaderParameter.builder();
        }
    }

    @Value.Immutable
    @StagedBuilderImmutablesStyle
    public interface EndpointPathParameter extends EndpointParameter {
        PathParameter pathParameter();

        @Override
        default Optional<String> docs() {
            return pathParameter().getDocs();
        }

        static ImmutableEndpointPathParameter.ParameterSpecBuildStage builder() {
            return ImmutableEndpointPathParameter.builder();
        }
    }

    @Value.Immutable
    @StagedBuilderImmutablesStyle
    public interface EndpointQueryParameter extends EndpointParameter {
        QueryParameter queryParameter();

        @Override
        default Optional<String> docs() {
            return queryParameter().getDocs();
        }

        static ImmutableEndpointQueryParameter.ParameterSpecBuildStage builder() {
            return ImmutableEndpointQueryParameter.builder();
        }
    }

    @Value.Immutable
    @StagedBuilderImmutablesStyle
    public interface EndpointRequestParameter extends EndpointParameter {
        HttpRequest httpRequest();

        @Override
        default Optional<String> docs() {
            return httpRequest().getDocs();
        }

        static ImmutableEndpointRequestParameter.ParameterSpecBuildStage builder() {
            return ImmutableEndpointRequestParameter.builder();
        }
    }
}
