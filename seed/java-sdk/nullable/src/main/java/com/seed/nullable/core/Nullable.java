package com.seed.nullable.core;

import java.util.Optional;

public class Nullable<T> {
    private Optional<T> value;

    private Nullable(T value) {
        this.value = value == null ? null : Optional.of(value);
    }

    private Nullable() {
        this.value = Optional.empty();
    }

    public boolean isNull() {
        return this.value == null;
    }

    public Optional<T> get() {
        return this.value;
    }

    public T getNull() {
        return null;
    }

    public static <T> Nullable<T> of(T value) {
        if (value == null) return ofNull();
        return new Nullable<>(value);
    }

    public static <T> Nullable<T> empty() {
        return new Nullable<>();
    }

    public static <T> Nullable<T> ofNull() {
        return new Nullable<>(null);
    }
}
