package com.seed.exhaustive.resources.types.union.types;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.seed.exhaustive.core.ObjectMappers;
import java.util.Objects;

@JsonInclude(JsonInclude.Include.NON_EMPTY)
@JsonDeserialize(builder = Cat.Builder.class)
public final class Cat {
    private final String name;

    private final boolean likesToMeow;

    private Cat(String name, boolean likesToMeow) {
        this.name = name;
        this.likesToMeow = likesToMeow;
    }

    @JsonProperty("name")
    public String getName() {
        return name;
    }

    @JsonProperty("likesToMeow")
    public boolean getLikesToMeow() {
        return likesToMeow;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) return true;
        return other instanceof Cat && equalTo((Cat) other);
    }

    private boolean equalTo(Cat other) {
        return name.equals(other.name) && likesToMeow == other.likesToMeow;
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.name, this.likesToMeow);
    }

    @Override
    public String toString() {
        return ObjectMappers.stringify(this);
    }

    public static NameStage builder() {
        return new Builder();
    }

    public interface NameStage {
        LikesToMeowStage name(String name);

        Builder from(Cat other);
    }

    public interface LikesToMeowStage {
        _FinalStage likesToMeow(boolean likesToMeow);
    }

    public interface _FinalStage {
        Cat build();
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static final class Builder implements NameStage, LikesToMeowStage, _FinalStage {
        private String name;

        private boolean likesToMeow;

        private Builder() {}

        @Override
        public Builder from(Cat other) {
            name(other.getName());
            likesToMeow(other.getLikesToMeow());
            return this;
        }

        @Override
        @JsonSetter("name")
        public LikesToMeowStage name(String name) {
            this.name = name;
            return this;
        }

        @Override
        @JsonSetter("likesToMeow")
        public _FinalStage likesToMeow(boolean likesToMeow) {
            this.likesToMeow = likesToMeow;
            return this;
        }

        @Override
        public Cat build() {
            return new Cat(name, likesToMeow);
        }
    }
}
