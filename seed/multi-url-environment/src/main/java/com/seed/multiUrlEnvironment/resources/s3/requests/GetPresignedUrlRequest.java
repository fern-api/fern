package com.seed.multiUrlEnvironment.resources.s3.requests;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import java.util.Objects;

@JsonInclude(JsonInclude.Include.NON_EMPTY)
@JsonDeserialize(builder = GetPresignedUrlRequest.Builder.class)
public final class GetPresignedUrlRequest {
    private final String s3Key;

    private GetPresignedUrlRequest(String s3Key) {
        this.s3Key = s3Key;
    }

    @JsonProperty("s3Key")
    public String getS3Key() {
        return s3Key;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) return true;
        return other instanceof GetPresignedUrlRequest && equalTo((GetPresignedUrlRequest) other);
    }

    private boolean equalTo(GetPresignedUrlRequest other) {
        return s3Key.equals(other.s3Key);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.s3Key);
    }

    @Override
    public String toString() {
        return "GetPresignedUrlRequest{" + "s3Key: " + s3Key + "}";
    }

    public static S3KeyStage builder() {
        return new Builder();
    }

    public interface S3KeyStage {
        _FinalStage s3Key(String s3Key);

        Builder from(GetPresignedUrlRequest other);
    }

    public interface _FinalStage {
        GetPresignedUrlRequest build();
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static final class Builder implements S3KeyStage, _FinalStage {
        private String s3Key;

        private Builder() {}

        @Override
        public Builder from(GetPresignedUrlRequest other) {
            s3Key(other.getS3Key());
            return this;
        }

        @Override
        @JsonSetter("s3Key")
        public _FinalStage s3Key(String s3Key) {
            this.s3Key = s3Key;
            return this;
        }

        @Override
        public GetPresignedUrlRequest build() {
            return new GetPresignedUrlRequest(s3Key);
        }
    }
}
