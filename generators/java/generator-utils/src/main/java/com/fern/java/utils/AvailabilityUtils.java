package com.fern.java.utils;

import com.fern.ir.model.commons.Availability;
import com.fern.ir.model.commons.AvailabilityStatus;
import com.fern.ir.model.http.HttpEndpoint;
import java.util.Optional;

/**
 * Helpers for translating the IR {@link Availability} metadata on endpoints into Java deprecation/beta annotations and
 * Javadoc. Mirrors the TypeScript {@code getAvailabilityDocs} helper so Java SDKs surface endpoint availability
 * consistently with other generators.
 */
public final class AvailabilityUtils {

    static final String IN_DEVELOPMENT_DOCS = "@beta This endpoint is in development and may change.";
    static final String PRE_RELEASE_DOCS = "@beta This endpoint is in pre-release and may change.";
    static final String DEPRECATED_DOCS = "@deprecated";

    private AvailabilityUtils() {}

    /**
     * Returns Javadoc text for the given endpoint's availability, mirroring the wording used by the TypeScript SDK
     * generator. Returns {@link Optional#empty()} when no availability is set or the endpoint is generally available.
     */
    public static Optional<String> getAvailabilityDocs(HttpEndpoint endpoint) {
        return getAvailabilityDocs(endpoint.getAvailability());
    }

    public static Optional<String> getAvailabilityDocs(Optional<Availability> availability) {
        if (availability.isEmpty()) {
            return Optional.empty();
        }
        Availability value = availability.get();
        Optional<String> message = value.getMessage();
        AvailabilityStatus.Value status = value.getStatus().getEnumValue();
        switch (status) {
            case DEPRECATED:
                return Optional.of(message.map(m -> DEPRECATED_DOCS + " " + m).orElse(DEPRECATED_DOCS));
            case IN_DEVELOPMENT:
                return Optional.of(
                        message.map(m -> IN_DEVELOPMENT_DOCS + " " + m).orElse(IN_DEVELOPMENT_DOCS));
            case PRE_RELEASE:
                return Optional.of(message.map(m -> PRE_RELEASE_DOCS + " " + m).orElse(PRE_RELEASE_DOCS));
            case GENERAL_AVAILABILITY:
            case UNKNOWN:
            default:
                return Optional.empty();
        }
    }

    /**
     * Returns {@code true} when the endpoint is marked as deprecated in the IR, signalling that the generated method
     * should carry a {@code @Deprecated} annotation.
     */
    public static boolean isDeprecated(HttpEndpoint endpoint) {
        return isDeprecated(endpoint.getAvailability());
    }

    public static boolean isDeprecated(Optional<Availability> availability) {
        return availability
                .map(a -> a.getStatus().getEnumValue() == AvailabilityStatus.Value.DEPRECATED)
                .orElse(false);
    }
}
