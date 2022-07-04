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

package com.fern.codegen.utils;

import com.fern.java.exception.HttpException;
import com.fern.java.immutables.AliasImmutablesStyle;
import com.fern.java.jackson.ClientObjectMappers;
import com.fern.java.jersey.ResourceInfoUtils;
import com.squareup.javapoet.ClassName;
import java.util.Optional;
import javax.ws.rs.container.ResourceInfo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class ClassNameConstants {

    // Loggers
    public static final ClassName LOGGER_CLASS_NAME = ClassName.get(Logger.class);
    public static final ClassName LOGGER_FACTORY_CLASS_NAME = ClassName.get(LoggerFactory.class);
    public static final String LOGGER_FIELD_NAME = "log";
    public static final String GET_LOGGER_METHOD_NAME = getMethodName(LoggerFactory.class, "getLogger", Class.class);

    // Common Java Classes
    public static final ClassName STRING_CLASS_NAME = ClassName.get(String.class);
    public static final ClassName EXCEPTION_CLASS_NAME = ClassName.get(Exception.class);
    public static final ClassName OPTIONAL_CLASS_NAME = ClassName.get(Optional.class);

    public static final ClassName RESOURCE_INFO_UTILS_CLASSNAME = ClassName.get(ResourceInfoUtils.class);
    public static final String RESOURCE_INFO_GET_INTERFACE_NAMES_METHOD_NAME =
            getMethodName(ResourceInfoUtils.class, "getInterfaceNames", ResourceInfo.class);
    public static final String RESOURCE_INFO_GET_METHOD_NAME_METHOD_NAME =
            getMethodName(ResourceInfoUtils.class, "getMethodName", ResourceInfo.class);

    public static final ClassName HTTP_EXCEPTION_CLASSNAME = ClassName.get(HttpException.class);
    public static final String HTTP_EXCEPTION_ERROR_INSTANCE_ID_METHOD_NAME =
            getMethodName(HttpException.class, "getErrorInstanceId");

    public static final ClassName ALIAS_IMMUTABLES_STYLE_CLASSNAME = ClassName.get(AliasImmutablesStyle.class);

    public static final ClassName CLIENT_OBJECT_MAPPERS_CLASS_NAME = ClassName.get(ClientObjectMappers.class);
    public static final String CLIENT_OBJECT_MAPPERS_JSON_MAPPER_FIELD_NAME =
            getFieldName(ClientObjectMappers.class, "JSON_MAPPER");

    private ClassNameConstants() {}

    private static String getFieldName(Class<?> clazz, String fieldName) {
        try {
            return clazz.getField(fieldName).getName();
        } catch (NoSuchFieldException e) {
            throw new IllegalStateException(
                    "Could not find field: " + fieldName + "in class: " + clazz.getSimpleName(), e);
        }
    }

    private static String getMethodName(Class<?> clazz, String methodName, Class<?>... parameters) {
        try {
            return clazz.getMethod(methodName, parameters).getName();
        } catch (NoSuchMethodException e) {
            throw new IllegalStateException(
                    "Could not find method: " + methodName + "in class: " + clazz.getSimpleName(), e);
        }
    }
}
