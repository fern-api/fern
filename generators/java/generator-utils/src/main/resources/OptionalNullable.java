package core;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Function;

/**
 * An optional wrapper type that supports null values, distinguishing between:
 * - ABSENT: field not present (e.g., not included in request)
 * - NULL: field explicitly set to null
 * - PRESENT: field has a non-null value
 * 
 * This is useful for partial updates, JSON Merge Patch (RFC 7396), and any API
 * that needs to differentiate between "not specified" and "set to null".
 * 
 * Use this for optional<nullable<T>> types where null is a valid value.
 * For regular optional<T> types (where null is not valid), use Optional<T> instead.
 */
public final class OptionalNullable<T> {
    
    private enum State {
        ABSENT,
        NULL,
        PRESENT
    }
    
    private final State state;
    private final T value;
    
    private OptionalNullable(State state, T value) {
        this.state = state;
        this.value = value;
    }
    
    /**
     * Creates an absent OptionalNullable (field not present).
     */
    public static <T> OptionalNullable<T> absent() {
        return new OptionalNullable<>(State.ABSENT, null);
    }
    
    /**
     * Creates a null OptionalNullable (field explicitly set to null).
     */
    public static <T> OptionalNullable<T> ofNull() {
        return new OptionalNullable<>(State.NULL, null);
    }
    
    /**
     * Creates an OptionalNullable with a value.
     */
    public static <T> OptionalNullable<T> of(T value) {
        Objects.requireNonNull(value, "Use ofNull() for null values");
        return new OptionalNullable<>(State.PRESENT, value);
    }
    
    /**
     * Creates an OptionalNullable from a nullable value.
     */
    @JsonCreator
    public static <T> OptionalNullable<T> ofNullable(T value) {
        return value == null ? ofNull() : of(value);
    }
    
    /**
     * Returns true if the field was absent from the request.
     */
    public boolean isAbsent() {
        return state == State.ABSENT;
    }
    
    /**
     * Returns true if the field was explicitly set to null.
     */
    public boolean isNull() {
        return state == State.NULL;
    }
    
    /**
     * Returns true if the field has a value.
     */
    public boolean isPresent() {
        return state == State.PRESENT;
    }
    
    /**
     * Returns true if the field was present in the request (either null or with a value).
     */
    public boolean wasSpecified() {
        return state != State.ABSENT;
    }
    
    /**
     * Gets the value if present, throws if absent or null.
     */
    public T get() {
        if (state != State.PRESENT) {
            throw new IllegalStateException("Cannot get value from " + state + " OptionalNullable");
        }
        return value;
    }
    
    /**
     * Gets the value if present or explicitly null, throws if absent.
     * This is useful for update operations where null is a valid value to set.
     */
    public T getValueOrNull() {
        if (state == State.ABSENT) {
            throw new IllegalStateException("No value set");
        }
        return value;  // Returns the actual value if PRESENT, or null if NULL
    }
    
    /**
     * Gets the value if present, returns null if explicitly set to null, or returns the provided default if absent.
     */
    public T orElse(T defaultValue) {
        if (state == State.PRESENT) return value;
        if (state == State.NULL) return null;
        return defaultValue;
    }
    
    /**
     * Converts to an Optional, returning empty for both absent and null states.
     */
    public Optional<T> toOptional() {
        return state == State.PRESENT ? Optional.of(value) : Optional.empty();
    }
    
    /**
     * Maps the value if present, preserving absent and null states.
     */
    public <U> OptionalNullable<U> map(Function<? super T, ? extends U> mapper) {
        if (state == State.PRESENT) {
            return OptionalNullable.of(mapper.apply(value));
        } else if (state == State.NULL) {
            return OptionalNullable.ofNull();
        } else {
            return OptionalNullable.absent();
        }
    }
    
    /**
     * For JSON serialization - serialize the actual value or null.
     * Absent values should be handled by @JsonInclude(JsonInclude.Include.CUSTOM)
     */
    @JsonValue
    public Object getJsonValue() {
        if (state == State.ABSENT) {
            // Should not be serialized - handled by custom inclusion
            throw new IllegalStateException("Absent values should not be serialized");
        }
        return state == State.NULL ? null : value;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        OptionalNullable<?> that = (OptionalNullable<?>) o;
        return state == that.state && Objects.equals(value, that.value);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(state, value);
    }
    
    @Override
    public String toString() {
        switch (state) {
            case ABSENT:
                return "OptionalNullable.absent()";
            case NULL:
                return "OptionalNullable.ofNull()";
            case PRESENT:
                return "OptionalNullable.of(" + value + ")";
            default:
                throw new IllegalStateException("Unknown state: " + state);
        }
    }
}