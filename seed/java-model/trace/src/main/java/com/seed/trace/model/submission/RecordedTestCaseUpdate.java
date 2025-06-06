/**
 * This file was auto-generated by Fern from our API Definition.
 */

package com.seed.trace.model.submission;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.seed.trace.core.ObjectMappers;
import java.lang.Object;
import java.lang.String;
import java.util.Objects;

@JsonInclude(JsonInclude.Include.NON_ABSENT)
@JsonDeserialize(
    builder = RecordedTestCaseUpdate.Builder.class
)
public final class RecordedTestCaseUpdate {
  private final String testCaseId;

  private final int traceResponsesSize;

  private RecordedTestCaseUpdate(String testCaseId, int traceResponsesSize) {
    this.testCaseId = testCaseId;
    this.traceResponsesSize = traceResponsesSize;
  }

  @JsonProperty("testCaseId")
  public String getTestCaseId() {
    return testCaseId;
  }

  @JsonProperty("traceResponsesSize")
  public int getTraceResponsesSize() {
    return traceResponsesSize;
  }

  @java.lang.Override
  public boolean equals(Object other) {
    if (this == other) return true;
    return other instanceof RecordedTestCaseUpdate && equalTo((RecordedTestCaseUpdate) other);
  }

  private boolean equalTo(RecordedTestCaseUpdate other) {
    return testCaseId.equals(other.testCaseId) && traceResponsesSize == other.traceResponsesSize;
  }

  @java.lang.Override
  public int hashCode() {
    return Objects.hash(this.testCaseId, this.traceResponsesSize);
  }

  @java.lang.Override
  public String toString() {
    return ObjectMappers.stringify(this);
  }

  public static TestCaseIdStage builder() {
    return new Builder();
  }

  public interface TestCaseIdStage {
    TraceResponsesSizeStage testCaseId(String testCaseId);

    Builder from(RecordedTestCaseUpdate other);
  }

  public interface TraceResponsesSizeStage {
    _FinalStage traceResponsesSize(int traceResponsesSize);
  }

  public interface _FinalStage {
    RecordedTestCaseUpdate build();
  }

  @JsonIgnoreProperties(
      ignoreUnknown = true
  )
  public static final class Builder implements TestCaseIdStage, TraceResponsesSizeStage, _FinalStage {
    private String testCaseId;

    private int traceResponsesSize;

    private Builder() {
    }

    @java.lang.Override
    public Builder from(RecordedTestCaseUpdate other) {
      testCaseId(other.getTestCaseId());
      traceResponsesSize(other.getTraceResponsesSize());
      return this;
    }

    @java.lang.Override
    @JsonSetter("testCaseId")
    public TraceResponsesSizeStage testCaseId(String testCaseId) {
      this.testCaseId = Objects.requireNonNull(testCaseId, "testCaseId must not be null");
      return this;
    }

    @java.lang.Override
    @JsonSetter("traceResponsesSize")
    public _FinalStage traceResponsesSize(int traceResponsesSize) {
      this.traceResponsesSize = traceResponsesSize;
      return this;
    }

    @java.lang.Override
    public RecordedTestCaseUpdate build() {
      return new RecordedTestCaseUpdate(testCaseId, traceResponsesSize);
    }
  }
}
