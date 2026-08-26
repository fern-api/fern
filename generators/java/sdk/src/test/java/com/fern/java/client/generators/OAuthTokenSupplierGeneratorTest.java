package com.fern.java.client.generators;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Optional;
import org.junit.jupiter.api.Test;

class OAuthTokenSupplierGeneratorTest {

    @Test
    void preservesDefaultHeaderAndPrefix() {
        assertThat(OAuthTokenSupplierGenerator.getTokenHeader(Optional.empty())).isEqualTo("Authorization");
        assertThat(OAuthTokenSupplierGenerator.getTokenPrefixWithSpace(Optional.empty()))
                .contains("Bearer ");
    }

    @Test
    void respectsCustomHeaderWithoutSpacingForEmptyPrefix() {
        assertThat(OAuthTokenSupplierGenerator.getTokenHeader(Optional.of("X-Custom-Token")))
                .isEqualTo("X-Custom-Token");
        assertThat(OAuthTokenSupplierGenerator.getTokenPrefixWithSpace(Optional.of("")))
                .isEmpty();
    }

    @Test
    void addsOneSeparatorForCustomPrefix() {
        assertThat(OAuthTokenSupplierGenerator.getTokenPrefixWithSpace(Optional.of("Token")))
                .contains("Token ");
    }
}
