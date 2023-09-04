package com.seed.trace.resources.submission.types;

import com.seed.trace.core.ObjectMappers;

public final class TerminatedResponse {
    private TerminatedResponse() {}

    @Override
    public boolean equals(Object other) {
        if (this == other) return true;
        return other instanceof TerminatedResponse;
    }

    @Override
    public String toString() {
        return ObjectMappers.stringify(this);
    }
}
