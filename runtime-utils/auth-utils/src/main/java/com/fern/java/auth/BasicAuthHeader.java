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

package com.fern.java.auth;

import com.fasterxml.jackson.annotation.JsonValue;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import org.immutables.value.Value;

@Value.Immutable
@Value.Style(visibility = Value.Style.ImplementationVisibility.PACKAGE, jdkOnly = true)
public abstract class BasicAuthHeader {

    private String username = null;
    private String password = null;

    @Value.Parameter
    @JsonValue
    public abstract String getToken();

    public final String username() {
        decode();
        return this.username;
    }

    public final String password() {
        decode();
        return this.password;
    }

    public final void decode() {
        if (this.username == null || this.password == null) {
            byte[] decodedToken = Base64.getDecoder().decode(getToken());
            String credentials = new String(decodedToken, StandardCharsets.UTF_8);
            final String[] values = credentials.split(":", 2);
            if (values.length != 2) {
                throw new IllegalStateException("Failed to decode basic token");
            }
            this.username = values[0];
            this.password = values[1];
        }
    }

    @Override
    public final String toString() {
        return "Basic " + getToken();
    }

    public static BasicAuthHeader of(String username, String password) {
        String unencodedToken = username + ":" + password;
        return ImmutableBasicAuthHeader.of(Base64.getEncoder().encodeToString(unencodedToken.getBytes()));
    }
}
