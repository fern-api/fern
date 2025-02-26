package com.seed.nullable.core;

import java.util.Optional;

public class NullableValueFilter {
    @Override
    public boolean equals(Object o) {
        return o instanceof Optional && !((Optional<?>) o).isPresent();
    }
}
