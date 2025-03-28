/**
 * This file was auto-generated by Fern from our API Definition.
 */
package com.seed.api.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.seed.api.core.ObjectMappers;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@JsonInclude(JsonInclude.Include.NON_ABSENT)
@JsonDeserialize(builder = Script.Builder.class)
public final class Script implements IBaseResource {
    private final String id;

    private final List<ResourceList> relatedResources;

    private final Memo memo;

    private final String name;

    private Script(String id, List<ResourceList> relatedResources, Memo memo, String name) {
        this.id = id;
        this.relatedResources = relatedResources;
        this.memo = memo;
        this.name = name;
    }

    @JsonProperty("id")
    @java.lang.Override
    public String getId() {
        return id;
    }

    @JsonProperty("related_resources")
    @java.lang.Override
    public List<ResourceList> getRelatedResources() {
        return relatedResources;
    }

    @JsonProperty("memo")
    @java.lang.Override
    public Memo getMemo() {
        return memo;
    }

    @JsonProperty("resource_type")
    public String getResourceType() {
        return "Script";
    }

    @JsonProperty("name")
    public String getName() {
        return name;
    }

    @java.lang.Override
    public boolean equals(Object other) {
        if (this == other) return true;
        return other instanceof Script && equalTo((Script) other);
    }

    private boolean equalTo(Script other) {
        return id.equals(other.id)
                && relatedResources.equals(other.relatedResources)
                && memo.equals(other.memo)
                && name.equals(other.name);
    }

    @java.lang.Override
    public int hashCode() {
        return Objects.hash(this.id, this.relatedResources, this.memo, this.name);
    }

    @java.lang.Override
    public String toString() {
        return ObjectMappers.stringify(this);
    }

    public static IdStage builder() {
        return new Builder();
    }

    public interface IdStage {
        MemoStage id(String id);

        Builder from(Script other);
    }

    public interface MemoStage {
        NameStage memo(Memo memo);
    }

    public interface NameStage {
        _FinalStage name(String name);
    }

    public interface _FinalStage {
        Script build();

        _FinalStage relatedResources(List<ResourceList> relatedResources);

        _FinalStage addRelatedResources(ResourceList relatedResources);

        _FinalStage addAllRelatedResources(List<ResourceList> relatedResources);
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static final class Builder implements IdStage, MemoStage, NameStage, _FinalStage {
        private String id;

        private Memo memo;

        private String name;

        private List<ResourceList> relatedResources = new ArrayList<>();

        private Builder() {}

        @java.lang.Override
        public Builder from(Script other) {
            id(other.getId());
            relatedResources(other.getRelatedResources());
            memo(other.getMemo());
            name(other.getName());
            return this;
        }

        @java.lang.Override
        @JsonSetter("id")
        public MemoStage id(String id) {
            this.id = Objects.requireNonNull(id, "id must not be null");
            return this;
        }

        @java.lang.Override
        @JsonSetter("memo")
        public NameStage memo(Memo memo) {
            this.memo = Objects.requireNonNull(memo, "memo must not be null");
            return this;
        }

        @java.lang.Override
        @JsonSetter("name")
        public _FinalStage name(String name) {
            this.name = Objects.requireNonNull(name, "name must not be null");
            return this;
        }

        @java.lang.Override
        public _FinalStage addAllRelatedResources(List<ResourceList> relatedResources) {
            this.relatedResources.addAll(relatedResources);
            return this;
        }

        @java.lang.Override
        public _FinalStage addRelatedResources(ResourceList relatedResources) {
            this.relatedResources.add(relatedResources);
            return this;
        }

        @java.lang.Override
        @JsonSetter(value = "related_resources", nulls = Nulls.SKIP)
        public _FinalStage relatedResources(List<ResourceList> relatedResources) {
            this.relatedResources.clear();
            this.relatedResources.addAll(relatedResources);
            return this;
        }

        @java.lang.Override
        public Script build() {
            return new Script(id, relatedResources, memo, name);
        }
    }
}
