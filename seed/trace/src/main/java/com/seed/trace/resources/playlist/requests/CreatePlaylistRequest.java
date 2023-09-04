package com.seed.trace.resources.playlist.requests;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.seed.trace.core.ObjectMappers;
import com.seed.trace.resources.playlist.types.PlaylistCreateRequest;
import java.time.OffsetDateTime;
import java.util.Objects;
import java.util.Optional;

@JsonInclude(JsonInclude.Include.NON_EMPTY)
@JsonDeserialize(builder = CreatePlaylistRequest.Builder.class)
public final class CreatePlaylistRequest {
    private final OffsetDateTime datetime;

    private final Optional<OffsetDateTime> optionalDatetime;

    private final PlaylistCreateRequest body;

    private CreatePlaylistRequest(
            OffsetDateTime datetime, Optional<OffsetDateTime> optionalDatetime, PlaylistCreateRequest body) {
        this.datetime = datetime;
        this.optionalDatetime = optionalDatetime;
        this.body = body;
    }

    @JsonProperty("datetime")
    public OffsetDateTime getDatetime() {
        return datetime;
    }

    @JsonProperty("optionalDatetime")
    public Optional<OffsetDateTime> getOptionalDatetime() {
        return optionalDatetime;
    }

    @JsonProperty("body")
    public PlaylistCreateRequest getBody() {
        return body;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) return true;
        return other instanceof CreatePlaylistRequest && equalTo((CreatePlaylistRequest) other);
    }

    private boolean equalTo(CreatePlaylistRequest other) {
        return datetime.equals(other.datetime)
                && optionalDatetime.equals(other.optionalDatetime)
                && body.equals(other.body);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.datetime, this.optionalDatetime, this.body);
    }

    @Override
    public String toString() {
        return ObjectMappers.stringify(this);
    }

    public static DatetimeStage builder() {
        return new Builder();
    }

    public interface DatetimeStage {
        BodyStage datetime(OffsetDateTime datetime);

        Builder from(CreatePlaylistRequest other);
    }

    public interface BodyStage {
        _FinalStage body(PlaylistCreateRequest body);
    }

    public interface _FinalStage {
        CreatePlaylistRequest build();

        _FinalStage optionalDatetime(Optional<OffsetDateTime> optionalDatetime);

        _FinalStage optionalDatetime(OffsetDateTime optionalDatetime);
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static final class Builder implements DatetimeStage, BodyStage, _FinalStage {
        private OffsetDateTime datetime;

        private PlaylistCreateRequest body;

        private Optional<OffsetDateTime> optionalDatetime = Optional.empty();

        private Builder() {}

        @Override
        public Builder from(CreatePlaylistRequest other) {
            datetime(other.getDatetime());
            optionalDatetime(other.getOptionalDatetime());
            body(other.getBody());
            return this;
        }

        @Override
        @JsonSetter("datetime")
        public BodyStage datetime(OffsetDateTime datetime) {
            this.datetime = datetime;
            return this;
        }

        @Override
        @JsonSetter("body")
        public _FinalStage body(PlaylistCreateRequest body) {
            this.body = body;
            return this;
        }

        @Override
        public _FinalStage optionalDatetime(OffsetDateTime optionalDatetime) {
            this.optionalDatetime = Optional.of(optionalDatetime);
            return this;
        }

        @Override
        @JsonSetter(value = "optionalDatetime", nulls = Nulls.SKIP)
        public _FinalStage optionalDatetime(Optional<OffsetDateTime> optionalDatetime) {
            this.optionalDatetime = optionalDatetime;
            return this;
        }

        @Override
        public CreatePlaylistRequest build() {
            return new CreatePlaylistRequest(datetime, optionalDatetime, body);
        }
    }
}
