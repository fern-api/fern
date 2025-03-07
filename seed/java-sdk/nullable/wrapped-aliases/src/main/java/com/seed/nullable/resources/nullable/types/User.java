/**
 * This file was auto-generated by Fern from our API Definition.
 */
package com.seed.nullable.resources.nullable.types;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.seed.nullable.core.Nullable;
import com.seed.nullable.core.NullableNonemptyFilter;
import com.seed.nullable.core.ObjectMappers;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import org.jetbrains.annotations.NotNull;

@JsonInclude(JsonInclude.Include.NON_ABSENT)
@JsonDeserialize(builder = User.Builder.class)
public final class User {
    private final String name;

    private final UserId id;

    private final Optional<List<String>> tags;

    private final Optional<Metadata> metadata;

    private final Email email;

    private final WeirdNumber favoriteNumber;

    private final Map<String, Object> additionalProperties;

    private User(
            String name,
            UserId id,
            Optional<List<String>> tags,
            Optional<Metadata> metadata,
            Email email,
            WeirdNumber favoriteNumber,
            Map<String, Object> additionalProperties) {
        this.name = name;
        this.id = id;
        this.tags = tags;
        this.metadata = metadata;
        this.email = email;
        this.favoriteNumber = favoriteNumber;
        this.additionalProperties = additionalProperties;
    }

    @JsonProperty("name")
    public String getName() {
        return name;
    }

    @JsonProperty("id")
    public UserId getId() {
        return id;
    }

    public Optional<List<String>> getTags() {
        if (tags == null) {
            return Optional.empty();
        }
        return tags;
    }

    public Optional<Metadata> getMetadata() {
        if (metadata == null) {
            return Optional.empty();
        }
        return metadata;
    }

    public Email getEmail() {
        if (email == null) {
            return Email.of(Optional.empty());
        }
        return email;
    }

    @JsonProperty("favorite-number")
    public WeirdNumber getFavoriteNumber() {
        return favoriteNumber;
    }

    @JsonInclude(value = JsonInclude.Include.CUSTOM, valueFilter = NullableNonemptyFilter.class)
    @JsonProperty("tags")
    private Optional<List<String>> _getTags() {
        return tags;
    }

    @JsonInclude(value = JsonInclude.Include.CUSTOM, valueFilter = NullableNonemptyFilter.class)
    @JsonProperty("metadata")
    private Optional<Metadata> _getMetadata() {
        return metadata;
    }

    @JsonInclude(value = JsonInclude.Include.CUSTOM, valueFilter = NullableNonemptyFilter.class)
    @JsonProperty("email")
    private Email _getEmail() {
        return email;
    }

    @java.lang.Override
    public boolean equals(Object other) {
        if (this == other) return true;
        return other instanceof User && equalTo((User) other);
    }

    @JsonAnyGetter
    public Map<String, Object> getAdditionalProperties() {
        return this.additionalProperties;
    }

    private boolean equalTo(User other) {
        return name.equals(other.name)
                && id.equals(other.id)
                && tags.equals(other.tags)
                && metadata.equals(other.metadata)
                && email.equals(other.email)
                && favoriteNumber.equals(other.favoriteNumber);
    }

    @java.lang.Override
    public int hashCode() {
        return Objects.hash(this.name, this.id, this.tags, this.metadata, this.email, this.favoriteNumber);
    }

    @java.lang.Override
    public String toString() {
        return ObjectMappers.stringify(this);
    }

    public static NameStage builder() {
        return new Builder();
    }

    public interface NameStage {
        IdStage name(@NotNull String name);

        Builder from(User other);
    }

    public interface IdStage {
        EmailStage id(@NotNull UserId id);
    }

    public interface EmailStage {
        FavoriteNumberStage email(@NotNull Email email);

        FavoriteNumberStage email(Nullable<Email> email);
    }

    public interface FavoriteNumberStage {
        _FinalStage favoriteNumber(@NotNull WeirdNumber favoriteNumber);
    }

    public interface _FinalStage {
        User build();

        _FinalStage tags(Optional<List<String>> tags);

        _FinalStage tags(List<String> tags);

        _FinalStage tags(Nullable<List<String>> tags);

        _FinalStage metadata(Optional<Metadata> metadata);

        _FinalStage metadata(Metadata metadata);

        _FinalStage metadata(Nullable<Metadata> metadata);
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static final class Builder implements NameStage, IdStage, EmailStage, FavoriteNumberStage, _FinalStage {
        private String name;

        private UserId id;

        private Email email;

        private WeirdNumber favoriteNumber;

        private Optional<Metadata> metadata = Optional.empty();

        private Optional<List<String>> tags = Optional.empty();

        @JsonAnySetter
        private Map<String, Object> additionalProperties = new HashMap<>();

        private Builder() {}

        @java.lang.Override
        public Builder from(User other) {
            name(other.getName());
            id(other.getId());
            tags(other.getTags());
            metadata(other.getMetadata());
            email(other.getEmail());
            favoriteNumber(other.getFavoriteNumber());
            return this;
        }

        @java.lang.Override
        @JsonSetter("name")
        public IdStage name(@NotNull String name) {
            this.name = Objects.requireNonNull(name, "name must not be null");
            return this;
        }

        @java.lang.Override
        @JsonSetter("id")
        public EmailStage id(@NotNull UserId id) {
            this.id = Objects.requireNonNull(id, "id must not be null");
            return this;
        }

        public FavoriteNumberStage email(Nullable<Email> email) {
            if (email.isNull()) {
                this.email = null;
            } else if (email.isEmpty()) {
                this.email = Email.of(Optional.empty());
            } else {
                this.email = email.get();
            }
            return this;
        }

        @java.lang.Override
        @JsonSetter("email")
        public FavoriteNumberStage email(@NotNull Email email) {
            this.email = Objects.requireNonNull(email, "email must not be null");
            return this;
        }

        @java.lang.Override
        @JsonSetter("favorite-number")
        public _FinalStage favoriteNumber(@NotNull WeirdNumber favoriteNumber) {
            this.favoriteNumber = Objects.requireNonNull(favoriteNumber, "favoriteNumber must not be null");
            return this;
        }

        @java.lang.Override
        public _FinalStage metadata(Nullable<Metadata> metadata) {
            if (metadata.isNull()) {
                this.metadata = null;
            } else if (metadata.isEmpty()) {
                this.metadata = Optional.empty();
            } else {
                this.metadata = Optional.of(metadata.get());
            }
            return this;
        }

        @java.lang.Override
        public _FinalStage metadata(Metadata metadata) {
            this.metadata = Optional.ofNullable(metadata);
            return this;
        }

        @java.lang.Override
        @JsonSetter(value = "metadata", nulls = Nulls.SKIP)
        public _FinalStage metadata(Optional<Metadata> metadata) {
            this.metadata = metadata;
            return this;
        }

        @java.lang.Override
        public _FinalStage tags(Nullable<List<String>> tags) {
            if (tags.isNull()) {
                this.tags = null;
            } else if (tags.isEmpty()) {
                this.tags = Optional.empty();
            } else {
                this.tags = Optional.of(tags.get());
            }
            return this;
        }

        @java.lang.Override
        public _FinalStage tags(List<String> tags) {
            this.tags = Optional.ofNullable(tags);
            return this;
        }

        @java.lang.Override
        @JsonSetter(value = "tags", nulls = Nulls.SKIP)
        public _FinalStage tags(Optional<List<String>> tags) {
            this.tags = tags;
            return this;
        }

        @java.lang.Override
        public User build() {
            return new User(name, id, tags, metadata, email, favoriteNumber, additionalProperties);
        }
    }
}
