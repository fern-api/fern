package com.fern.java.utils;

import static org.assertj.core.api.Assertions.assertThat;

import com.fern.ir.model.commons.Availability;
import com.fern.ir.model.commons.AvailabilityStatus;
import java.util.Optional;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

public class AvailabilityUtilsTest {

    @Nested
    class GetAvailabilityDocsTests {

        @Test
        void returnsEmptyWhenAvailabilityAbsent() {
            assertThat(AvailabilityUtils.getAvailabilityDocs(Optional.<Availability>empty()))
                    .isEmpty();
        }

        @Test
        void returnsEmptyWhenGenerallyAvailable() {
            Availability availability = Availability.builder()
                    .status(AvailabilityStatus.GENERAL_AVAILABILITY)
                    .build();
            assertThat(AvailabilityUtils.getAvailabilityDocs(Optional.of(availability)))
                    .isEmpty();
        }

        @Test
        void deprecatedWithoutMessage() {
            Availability availability =
                    Availability.builder().status(AvailabilityStatus.DEPRECATED).build();
            assertThat(AvailabilityUtils.getAvailabilityDocs(Optional.of(availability)))
                    .contains("@deprecated");
        }

        @Test
        void deprecatedWithMessage() {
            Availability availability = Availability.builder()
                    .status(AvailabilityStatus.DEPRECATED)
                    .message("Use v2 instead")
                    .build();
            assertThat(AvailabilityUtils.getAvailabilityDocs(Optional.of(availability)))
                    .contains("@deprecated Use v2 instead");
        }

        @Test
        void inDevelopmentWithoutMessage() {
            Availability availability = Availability.builder()
                    .status(AvailabilityStatus.IN_DEVELOPMENT)
                    .build();
            assertThat(AvailabilityUtils.getAvailabilityDocs(Optional.of(availability)))
                    .contains("@apiNote This endpoint is in development and may change.");
        }

        @Test
        void inDevelopmentWithMessage() {
            Availability availability = Availability.builder()
                    .status(AvailabilityStatus.IN_DEVELOPMENT)
                    .message("Expected Q3 release")
                    .build();
            assertThat(AvailabilityUtils.getAvailabilityDocs(Optional.of(availability)))
                    .contains("@apiNote This endpoint is in development and may change. Expected Q3 release");
        }

        @Test
        void preReleaseWithoutMessage() {
            Availability availability = Availability.builder()
                    .status(AvailabilityStatus.PRE_RELEASE)
                    .build();
            assertThat(AvailabilityUtils.getAvailabilityDocs(Optional.of(availability)))
                    .contains("@apiNote This endpoint is in pre-release and may change.");
        }

        @Test
        void preReleaseWithMessage() {
            Availability availability = Availability.builder()
                    .status(AvailabilityStatus.PRE_RELEASE)
                    .message("Beta 2")
                    .build();
            assertThat(AvailabilityUtils.getAvailabilityDocs(Optional.of(availability)))
                    .contains("@apiNote This endpoint is in pre-release and may change. Beta 2");
        }
    }

    @Nested
    class IsDeprecatedTests {

        @Test
        void falseWhenAvailabilityAbsent() {
            assertThat(AvailabilityUtils.isDeprecated(Optional.<Availability>empty()))
                    .isFalse();
        }

        @Test
        void trueWhenDeprecated() {
            Availability availability =
                    Availability.builder().status(AvailabilityStatus.DEPRECATED).build();
            assertThat(AvailabilityUtils.isDeprecated(Optional.of(availability)))
                    .isTrue();
        }

        @Test
        void falseWhenInDevelopment() {
            Availability availability = Availability.builder()
                    .status(AvailabilityStatus.IN_DEVELOPMENT)
                    .build();
            assertThat(AvailabilityUtils.isDeprecated(Optional.of(availability)))
                    .isFalse();
        }

        @Test
        void falseWhenPreRelease() {
            Availability availability = Availability.builder()
                    .status(AvailabilityStatus.PRE_RELEASE)
                    .build();
            assertThat(AvailabilityUtils.isDeprecated(Optional.of(availability)))
                    .isFalse();
        }

        @Test
        void falseWhenGenerallyAvailable() {
            Availability availability = Availability.builder()
                    .status(AvailabilityStatus.GENERAL_AVAILABILITY)
                    .build();
            assertThat(AvailabilityUtils.isDeprecated(Optional.of(availability)))
                    .isFalse();
        }
    }
}
