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

package com.fern.java.client;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import java.io.IOException;
import java.time.Duration;
import java.util.Objects;
import java.util.Optional;

/**
 * The resolved value of the {@code default-timeout} config key. It is either a finite {@link Duration} or
 * {@code "infinity"} (which disables the timeout). The raw config value may be a number of seconds, an ISO-8601
 * duration string (e.g. {@code "PT30S"}), or the literal {@code "infinity"}. The parsing rules here mirror the v2
 * (TypeScript) generator so both stay aligned.
 */
@JsonDeserialize(using = DefaultTimeout.Deserializer.class)
public final class DefaultTimeout {

    private static final String INFINITY = "infinity";

    /** {@code null} iff this represents {@code "infinity"}. */
    private final Duration duration;

    private DefaultTimeout(Duration duration) {
        this.duration = duration;
    }

    public static DefaultTimeout ofDuration(Duration duration) {
        return new DefaultTimeout(Objects.requireNonNull(duration, "duration"));
    }

    public static DefaultTimeout infinity() {
        return new DefaultTimeout(null);
    }

    public boolean isInfinity() {
        return duration == null;
    }

    public Optional<Duration> asDuration() {
        return Optional.ofNullable(duration);
    }

    /**
     * The whole-second value passed to OkHttp's {@code callTimeout}, where {@code 0} disables the timeout.
     * {@code "infinity"} therefore maps to {@code 0}; a finite duration is truncated toward zero (matching
     * {@link Duration#getSeconds()}).
     */
    public int toCallTimeoutSeconds() {
        return duration == null ? 0 : (int) duration.getSeconds();
    }

    static DefaultTimeout fromString(String value) {
        String trimmed = value.trim();
        if (trimmed.equalsIgnoreCase(INFINITY)) {
            return infinity();
        }
        try {
            return ofDuration(secondsToDuration(Double.parseDouble(trimmed)));
        } catch (NumberFormatException notANumber) {
            // Not a plain number; fall through to ISO-8601 parsing.
        }
        return ofDuration(Duration.parse(trimmed));
    }

    static Duration secondsToDuration(double seconds) {
        long wholeSeconds = (long) seconds;
        long nanos = Math.round((seconds - wholeSeconds) * 1_000_000_000L);
        return Duration.ofSeconds(wholeSeconds).plusNanos(nanos);
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) {
            return true;
        }
        if (!(other instanceof DefaultTimeout)) {
            return false;
        }
        return Objects.equals(duration, ((DefaultTimeout) other).duration);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(duration);
    }

    @Override
    public String toString() {
        return isInfinity() ? "DefaultTimeout{infinity}" : "DefaultTimeout{" + duration + "}";
    }

    static final class Deserializer extends JsonDeserializer<DefaultTimeout> {
        @Override
        public DefaultTimeout deserialize(JsonParser parser, DeserializationContext context) throws IOException {
            JsonToken token = parser.currentToken();
            if (token != null && token.isNumeric()) {
                return ofDuration(secondsToDuration(parser.getDoubleValue()));
            }
            String text = parser.getValueAsString();
            if (text == null) {
                return null;
            }
            try {
                return fromString(text);
            } catch (RuntimeException e) {
                throw new IOException("Invalid default-timeout value: '" + text + "'", e);
            }
        }
    }
}
