package com.seed.trace.resources.playlist.types;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.seed.trace.core.ObjectMappers;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@JsonInclude(JsonInclude.Include.NON_EMPTY)
@JsonDeserialize(builder = Playlist.Builder.class)
public final class Playlist implements IPlaylistCreateRequest {
    private final String name;

    private final List<String> problems;

    private final String playlistId;

    private final String ownerId;

    private Playlist(String name, List<String> problems, String playlistId, String ownerId) {
        this.name = name;
        this.problems = problems;
        this.playlistId = playlistId;
        this.ownerId = ownerId;
    }

    @JsonProperty("name")
    @Override
    public String getName() {
        return name;
    }

    @JsonProperty("problems")
    @Override
    public List<String> getProblems() {
        return problems;
    }

    @JsonProperty("playlist_id")
    public String getPlaylistId() {
        return playlistId;
    }

    @JsonProperty("owner-id")
    public String getOwnerId() {
        return ownerId;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) return true;
        return other instanceof Playlist && equalTo((Playlist) other);
    }

    private boolean equalTo(Playlist other) {
        return name.equals(other.name)
                && problems.equals(other.problems)
                && playlistId.equals(other.playlistId)
                && ownerId.equals(other.ownerId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.name, this.problems, this.playlistId, this.ownerId);
    }

    @Override
    public String toString() {
        return ObjectMappers.stringify(this);
    }

    public static NameStage builder() {
        return new Builder();
    }

    public interface NameStage {
        PlaylistIdStage name(String name);

        Builder from(Playlist other);
    }

    public interface PlaylistIdStage {
        OwnerIdStage playlistId(String playlistId);
    }

    public interface OwnerIdStage {
        _FinalStage ownerId(String ownerId);
    }

    public interface _FinalStage {
        Playlist build();

        _FinalStage problems(List<String> problems);

        _FinalStage addProblems(String problems);

        _FinalStage addAllProblems(List<String> problems);
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static final class Builder implements NameStage, PlaylistIdStage, OwnerIdStage, _FinalStage {
        private String name;

        private String playlistId;

        private String ownerId;

        private List<String> problems = new ArrayList<>();

        private Builder() {}

        @Override
        public Builder from(Playlist other) {
            name(other.getName());
            problems(other.getProblems());
            playlistId(other.getPlaylistId());
            ownerId(other.getOwnerId());
            return this;
        }

        @Override
        @JsonSetter("name")
        public PlaylistIdStage name(String name) {
            this.name = name;
            return this;
        }

        @Override
        @JsonSetter("playlist_id")
        public OwnerIdStage playlistId(String playlistId) {
            this.playlistId = playlistId;
            return this;
        }

        @Override
        @JsonSetter("owner-id")
        public _FinalStage ownerId(String ownerId) {
            this.ownerId = ownerId;
            return this;
        }

        @Override
        public _FinalStage addAllProblems(List<String> problems) {
            this.problems.addAll(problems);
            return this;
        }

        @Override
        public _FinalStage addProblems(String problems) {
            this.problems.add(problems);
            return this;
        }

        @Override
        @JsonSetter(value = "problems", nulls = Nulls.SKIP)
        public _FinalStage problems(List<String> problems) {
            this.problems.clear();
            this.problems.addAll(problems);
            return this;
        }

        @Override
        public Playlist build() {
            return new Playlist(name, problems, playlistId, ownerId);
        }
    }
}
