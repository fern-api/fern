/**
 * This file was auto-generated by Fern from our API Definition.
 */
package com.seed.customAuth.resources.errors.errors;

import com.seed.customAuth.core.SeedCustomAuthApiException;

public final class BadRequest extends SeedCustomAuthApiException {
    public BadRequest(Object body) {
        super("BadRequest", 400, body);
    }
}
