package com.seed.trace.resources.submission.types;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.seed.trace.core.ObjectMappers;
import com.seed.trace.resources.v2.problem.types.ProblemInfoV2;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@JsonInclude(JsonInclude.Include.NON_EMPTY)
@JsonDeserialize(builder = TestSubmissionStatusV2.Builder.class)
public final class TestSubmissionStatusV2 {
    private final List<TestSubmissionUpdate> updates;

    private final String problemId;

    private final int problemVersion;

    private final ProblemInfoV2 problemInfo;

    private TestSubmissionStatusV2(
            List<TestSubmissionUpdate> updates, String problemId, int problemVersion, ProblemInfoV2 problemInfo) {
        this.updates = updates;
        this.problemId = problemId;
        this.problemVersion = problemVersion;
        this.problemInfo = problemInfo;
    }

    @JsonProperty("updates")
    public List<TestSubmissionUpdate> getUpdates() {
        return updates;
    }

    @JsonProperty("problemId")
    public String getProblemId() {
        return problemId;
    }

    @JsonProperty("problemVersion")
    public int getProblemVersion() {
        return problemVersion;
    }

    @JsonProperty("problemInfo")
    public ProblemInfoV2 getProblemInfo() {
        return problemInfo;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) return true;
        return other instanceof TestSubmissionStatusV2 && equalTo((TestSubmissionStatusV2) other);
    }

    private boolean equalTo(TestSubmissionStatusV2 other) {
        return updates.equals(other.updates)
                && problemId.equals(other.problemId)
                && problemVersion == other.problemVersion
                && problemInfo.equals(other.problemInfo);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.updates, this.problemId, this.problemVersion, this.problemInfo);
    }

    @Override
    public String toString() {
        return ObjectMappers.stringify(this);
    }

    public static ProblemIdStage builder() {
        return new Builder();
    }

    public interface ProblemIdStage {
        ProblemVersionStage problemId(String problemId);

        Builder from(TestSubmissionStatusV2 other);
    }

    public interface ProblemVersionStage {
        ProblemInfoStage problemVersion(int problemVersion);
    }

    public interface ProblemInfoStage {
        _FinalStage problemInfo(ProblemInfoV2 problemInfo);
    }

    public interface _FinalStage {
        TestSubmissionStatusV2 build();

        _FinalStage updates(List<TestSubmissionUpdate> updates);

        _FinalStage addUpdates(TestSubmissionUpdate updates);

        _FinalStage addAllUpdates(List<TestSubmissionUpdate> updates);
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static final class Builder implements ProblemIdStage, ProblemVersionStage, ProblemInfoStage, _FinalStage {
        private String problemId;

        private int problemVersion;

        private ProblemInfoV2 problemInfo;

        private List<TestSubmissionUpdate> updates = new ArrayList<>();

        private Builder() {}

        @Override
        public Builder from(TestSubmissionStatusV2 other) {
            updates(other.getUpdates());
            problemId(other.getProblemId());
            problemVersion(other.getProblemVersion());
            problemInfo(other.getProblemInfo());
            return this;
        }

        @Override
        @JsonSetter("problemId")
        public ProblemVersionStage problemId(String problemId) {
            this.problemId = problemId;
            return this;
        }

        @Override
        @JsonSetter("problemVersion")
        public ProblemInfoStage problemVersion(int problemVersion) {
            this.problemVersion = problemVersion;
            return this;
        }

        @Override
        @JsonSetter("problemInfo")
        public _FinalStage problemInfo(ProblemInfoV2 problemInfo) {
            this.problemInfo = problemInfo;
            return this;
        }

        @Override
        public _FinalStage addAllUpdates(List<TestSubmissionUpdate> updates) {
            this.updates.addAll(updates);
            return this;
        }

        @Override
        public _FinalStage addUpdates(TestSubmissionUpdate updates) {
            this.updates.add(updates);
            return this;
        }

        @Override
        @JsonSetter(value = "updates", nulls = Nulls.SKIP)
        public _FinalStage updates(List<TestSubmissionUpdate> updates) {
            this.updates.clear();
            this.updates.addAll(updates);
            return this;
        }

        @Override
        public TestSubmissionStatusV2 build() {
            return new TestSubmissionStatusV2(updates, problemId, problemVersion, problemInfo);
        }
    }
}
