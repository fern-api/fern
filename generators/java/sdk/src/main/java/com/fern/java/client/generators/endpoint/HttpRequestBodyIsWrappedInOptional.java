/*
 * (c) Copyright 2023 Birch Solutions Inc. All rights reserved.
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

package com.fern.java.client.generators.endpoint;

import com.fern.ir.model.http.BytesRequest;
import com.fern.ir.model.http.FileUploadRequest;
import com.fern.ir.model.http.HttpRequestBody;
import com.fern.ir.model.http.HttpRequestBodyReference;
import com.fern.ir.model.http.InlinedRequestBody;
import com.fern.ir.model.types.ContainerType;
import com.fern.ir.model.types.DeclaredTypeName;
import com.fern.ir.model.types.PrimitiveType;

public class HttpRequestBodyIsWrappedInOptional {

    private HttpRequestBodyIsWrappedInOptional() {}

    public static boolean isOptional(HttpRequestBody httpRequestBody) {
        return httpRequestBody.visit(HttpRequestBodyVisitor.INSTANCE);
    }

    public static final class HttpRequestBodyVisitor implements HttpRequestBody.Visitor<Boolean> {

        private static final HttpRequestBodyVisitor INSTANCE = new HttpRequestBodyVisitor();

        @Override
        public Boolean visitInlinedRequestBody(InlinedRequestBody inlinedRequestBody) {
            return false;
        }

        @Override
        public Boolean visitReference(HttpRequestBodyReference reference) {
            return reference.getRequestBodyType().visit(new TypeReferenceIsWrappedInOptional());
        }

        @Override
        public Boolean visitFileUpload(FileUploadRequest fileUpload) {
            return false;
        }

        @Override
        public Boolean visitBytes(BytesRequest bytes) {
            return false;
        }

        @Override
        public Boolean _visitUnknown(Object unknownType) {
            return false;
        }
    }

    private static class TypeReferenceIsWrappedInOptional
            implements com.fern.ir.model.types.TypeReference.Visitor<Boolean> {

        @Override
        public Boolean visitContainer(ContainerType container) {
            return container.isOptional();
        }

        @Override
        public Boolean visitNamed(DeclaredTypeName named) {
            return false;
        }

        @Override
        public Boolean visitPrimitive(PrimitiveType primitive) {
            return false;
        }

        @Override
        public Boolean visitUnknown() {
            return false;
        }

        @Override
        public Boolean _visitUnknown(Object unknownType) {
            return false;
        }
    }
}
