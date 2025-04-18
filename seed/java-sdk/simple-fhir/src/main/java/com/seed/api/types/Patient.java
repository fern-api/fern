/**
 * This file was auto-generated by Fern from our API Definition.
 */
package com.seed.api.types;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.seed.api.core.ObjectMappers;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import org.jetbrains.annotations.NotNull;

@JsonInclude(JsonInclude.Include.NON_ABSENT)
@JsonDeserialize(builder = Patient.Builder.class)
public final class Patient implements IBaseResource {
    private final String id;

    private final List<ResourceList> relatedResources;

    private final Memo memo;

    private final String name;

    private final List<Script> scripts;

    private final Map<String, Object> additionalProperties;

    private Patient(
            String id,
            List<ResourceList> relatedResources,
            Memo memo,
            String name,
            List<Script> scripts,
            Map<String, Object> additionalProperties) {
        this.id = id;
        this.relatedResources = relatedResources;
        this.memo = memo;
        this.name = name;
        this.scripts = scripts;
        this.additionalProperties = additionalProperties;
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
        return "Patient";
    }

    @JsonProperty("name")
    public String getName() {
        return name;
    }

    @JsonProperty("scripts")
    public List<Script> getScripts() {
        return scripts;
    }

    @java.lang.Override
    public boolean equals(Object other) {
        if (this == other) return true;
        return other instanceof Patient && equalTo((Patient) other);
    }

    @JsonAnyGetter
    public Map<String, Object> getAdditionalProperties() {
        return this.additionalProperties;
    }

    private boolean equalTo(Patient other) {
        return id.equals(other.id)
                && relatedResources.equals(other.relatedResources)
                && memo.equals(other.memo)
                && name.equals(other.name)
                && scripts.equals(other.scripts);
    }

    @java.lang.Override
    public int hashCode() {
        return Objects.hash(this.id, this.relatedResources, this.memo, this.name, this.scripts);
    }

    @java.lang.Override
    public String toString() {
        return ObjectMappers.stringify(this);
    }

    public static IdStage builder() {
        return new Builder();
    }

    public interface IdStage {
        MemoStage id(@NotNull String id);

        Builder from(Patient other);
    }

    public interface MemoStage {
        NameStage memo(@NotNull Memo memo);
    }

    public interface NameStage {
        _FinalStage name(@NotNull String name);
    }

    public interface _FinalStage {
        Patient build();

        _FinalStage relatedResources(List<ResourceList> relatedResources);

        _FinalStage addRelatedResources(ResourceList relatedResources);

        _FinalStage addAllRelatedResources(List<ResourceList> relatedResources);

        _FinalStage scripts(List<Script> scripts);

        _FinalStage addScripts(Script scripts);

        _FinalStage addAllScripts(List<Script> scripts);
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static final class Builder implements IdStage, MemoStage, NameStage, _FinalStage {
        private String id;

        private Memo memo;

        private String name;

        private List<Script> scripts = new ArrayList<>();

        private List<ResourceList> relatedResources = new ArrayList<>();

        @JsonAnySetter
        private Map<String, Object> additionalProperties = new HashMap<>();

        private Builder() {}

        @java.lang.Override
        public Builder from(Patient other) {
            id(other.getId());
            relatedResources(other.getRelatedResources());
            memo(other.getMemo());
            name(other.getName());
            scripts(other.getScripts());
            return this;
        }

        @java.lang.Override
        @JsonSetter("id")
        public MemoStage id(@NotNull String id) {
            this.id = Objects.requireNonNull(id, "id must not be null");
            return this;
        }

        @java.lang.Override
        @JsonSetter("memo")
        public NameStage memo(@NotNull Memo memo) {
            this.memo = Objects.requireNonNull(memo, "memo must not be null");
            return this;
        }

        @java.lang.Override
        @JsonSetter("name")
        public _FinalStage name(@NotNull String name) {
            this.name = Objects.requireNonNull(name, "name must not be null");
            return this;
        }

        @java.lang.Override
        public _FinalStage addAllScripts(List<Script> scripts) {
            this.scripts.addAll(scripts);
            return this;
        }

        @java.lang.Override
        public _FinalStage addScripts(Script scripts) {
            this.scripts.add(scripts);
            return this;
        }

        @java.lang.Override
        @JsonSetter(value = "scripts", nulls = Nulls.SKIP)
        public _FinalStage scripts(List<Script> scripts) {
            this.scripts.clear();
            this.scripts.addAll(scripts);
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
        public Patient build() {
            return new Patient(id, relatedResources, memo, name, scripts, additionalProperties);
        }
    }
}
