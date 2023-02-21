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

package com.fern.java.spring;

import com.fern.ir.model.services.http.HttpService;
import com.fern.java.AbstractNonModelPoetClassNameFactory;
import com.squareup.javapoet.ClassName;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

public final class SpringLocalFilesPoetClassNameFactory extends AbstractNonModelPoetClassNameFactory {

    public SpringLocalFilesPoetClassNameFactory(Optional<String> directoryNamePrefix) {
        super(directoryNamePrefix.map(List::of).orElseGet(() -> Collections.emptyList()));
    }

    public ClassName getServiceInterfaceClassName(HttpService httpService) {
        String packageName =
                getResourcesPackage(Optional.of(httpService.getName().getFernFilepath()), Optional.empty());
        return ClassName.get(packageName, httpService.getName().getName());
    }
}
