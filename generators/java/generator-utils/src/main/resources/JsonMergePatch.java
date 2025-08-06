package core;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Function;

/**
 * A wrapper type for JSON Merge Patch operations (RFC 7396) that distinguishes between:
 * - ABSENT: field not present in the request (don't modify)
 * - NULL: field explicitly set to null (delete/clear the field)
 * - PRESENT: field has a value (update the field)
 */
public final class JsonMergePatch<T> {
    
    private enum State {
        ABSENT,
        NULL,
        PRESENT
    }
    
    private final State state;
    private final T value;
    
    private JsonMergePatch(State state, T value) {
        this.state = state;
        this.value = value;
    }
    
    /**
     * Creates an absent JsonMergePatch (field not present).
     */
    public static <T> JsonMergePatch<T> absent() {
        return new JsonMergePatch<>(State.ABSENT, null);
    }
    
    /**
     * Creates a null JsonMergePatch (field explicitly set to null).
     */
    public static <T> JsonMergePatch<T> ofNull() {
        return new JsonMergePatch<>(State.NULL, null);
    }
    
    /**
     * Creates a JsonMergePatch with a value.
     */
    public static <T> JsonMergePatch<T> of(T value) {
        Objects.requireNonNull(value, "Use ofNull() for null values");
        return new JsonMergePatch<>(State.PRESENT, value);
    }
    
    /**
     * Creates a JsonMergePatch from a nullable value.
     */
    @JsonCreator
    public static <T> JsonMergePatch<T> ofNullable(T value) {
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
            throw new IllegalStateException("Cannot get value from " + state + " JsonMergePatch");
        }
        return value;
    }
    
    /**
     * Gets the value if present, returns the provided default if absent or null.
     */
    public T orElse(T defaultValue) {
        return state == State.PRESENT ? value : defaultValue;
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
    public <U> JsonMergePatch<U> map(Function<? super T, ? extends U> mapper) {
        if (state == State.PRESENT) {
            return JsonMergePatch.of(mapper.apply(value));
        } else if (state == State.NULL) {
            return JsonMergePatch.ofNull();
        } else {
            return JsonMergePatch.absent();
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
        JsonMergePatch<?> that = (JsonMergePatch<?>) o;
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
                return "JsonMergePatch.absent()";
            case NULL:
                return "JsonMergePatch.ofNull()";
            case PRESENT:
                return "JsonMergePatch.of(" + value + ")";
            default:
                throw new IllegalStateException("Unknown state: " + state);
        }
    }
}