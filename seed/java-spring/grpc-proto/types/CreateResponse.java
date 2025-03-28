/**
 * This file was auto-generated by Fern from our API Definition.
 */

package types;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import core.ObjectMappers;
import java.lang.Object;
import java.lang.String;
import java.util.Objects;
import java.util.Optional;

@JsonInclude(JsonInclude.Include.NON_ABSENT)
@JsonDeserialize(
    builder = CreateResponse.Builder.class
)
public final class CreateResponse {
  private final Optional<UserModel> user;

  private CreateResponse(Optional<UserModel> user) {
    this.user = user;
  }

  @JsonProperty("user")
  public Optional<UserModel> getUser() {
    return user;
  }

  @java.lang.Override
  public boolean equals(Object other) {
    if (this == other) return true;
    return other instanceof CreateResponse && equalTo((CreateResponse) other);
  }

  private boolean equalTo(CreateResponse other) {
    return user.equals(other.user);
  }

  @java.lang.Override
  public int hashCode() {
    return Objects.hash(this.user);
  }

  @java.lang.Override
  public String toString() {
    return ObjectMappers.stringify(this);
  }

  public static Builder builder() {
    return new Builder();
  }

  @JsonIgnoreProperties(
      ignoreUnknown = true
  )
  public static final class Builder {
    private Optional<UserModel> user = Optional.empty();

    private Builder() {
    }

    public Builder from(CreateResponse other) {
      user(other.getUser());
      return this;
    }

    @JsonSetter(
        value = "user",
        nulls = Nulls.SKIP
    )
    public Builder user(Optional<UserModel> user) {
      this.user = user;
      return this;
    }

    public Builder user(UserModel user) {
      this.user = Optional.ofNullable(user);
      return this;
    }

    public CreateResponse build() {
      return new CreateResponse(user);
    }
  }
}
