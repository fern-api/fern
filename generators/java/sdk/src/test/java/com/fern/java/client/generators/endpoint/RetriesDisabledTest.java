package com.fern.java.client.generators.endpoint;

import static org.assertj.core.api.Assertions.assertThat;

import com.fern.ir.model.http.RetriesConfiguration;
import com.fern.ir.model.http.RetriesDisabledSchema;
import java.util.Optional;
import org.junit.jupiter.api.Test;

/**
 * Pins when {@link AbstractHttpResponseParserGenerator#retriesDisabled} makes a call bypass automatic retries. Only an
 * endpoint that explicitly disables retries opts out, so every other endpoint keeps its existing output.
 */
class RetriesDisabledTest {

    @Test
    void noConfiguration_retriesStayEnabled() {
        assertThat(AbstractHttpResponseParserGenerator.retriesDisabled(Optional.empty()))
                .isFalse();
    }

    @Test
    void disabledTrue_retriesAreDisabled() {
        assertThat(AbstractHttpResponseParserGenerator.retriesDisabled(retries(Optional.of(true))))
                .isTrue();
    }

    @Test
    void disabledFalse_retriesStayEnabled() {
        assertThat(AbstractHttpResponseParserGenerator.retriesDisabled(retries(Optional.of(false))))
                .isFalse();
    }

    @Test
    void disabledAbsent_retriesStayEnabled() {
        assertThat(AbstractHttpResponseParserGenerator.retriesDisabled(retries(Optional.empty())))
                .isFalse();
    }

    private static Optional<RetriesConfiguration> retries(Optional<Boolean> disabled) {
        return Optional.of(RetriesConfiguration.of(
                RetriesDisabledSchema.builder().disabled(disabled).build()));
    }
}
