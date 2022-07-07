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

package com.example;

import com.fern.example.errors.GenericMessageError;
import com.fern.example.errors.GenericMessageErrorBody;
import com.fern.example.errors.NotFoundError;
import com.fern.example.errors.NotFoundErrorBody;
import com.fern.example.errors.UnauthorizedError;
import com.fern.example.errors.UnauthorizedErrorBody;
import com.fern.example.server.ExampleService;
import com.fern.example.types.ErrorType;
import com.fern.example.types.ExampleId;
import com.fern.example.types.ExampleObject;

public final class ExampleResource implements ExampleService {
    @Override
    public ExampleObject getExampleObject() {
        return ExampleObject.builder()
                .id(ExampleId.valueOf("id"))
                .stringValue("")
                .doubleValue(0.0)
                .build();
    }

    @Override
    public void throwError(ErrorType errorType) throws NotFoundError, UnauthorizedError, GenericMessageError {
        switch (errorType.getEnumValue()) {
            case NOT_FOUND:
                throw new NotFoundError(NotFoundErrorBody.builder().build());
            case UNAUTHORIZED:
                throw new UnauthorizedError(UnauthorizedErrorBody.builder().build());
            case GENERIC:
                throw new GenericMessageError(GenericMessageErrorBody.builder()
                        .msg("myMessage")
                        .build());
            case UNKNOWN:
                throw new RuntimeException("Encountered unknown errorType: " + errorType);
        }
    }
}
