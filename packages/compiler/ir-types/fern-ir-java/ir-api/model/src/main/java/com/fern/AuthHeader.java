package com.fern;

import com.fasterxml.jackson.annotation.JsonValue;
import java.lang.Override;
import java.lang.String;
import org.immutables.value.Value;

@Value.Immutable
@PackagePrivateStyle
public abstract class AuthHeader {
  @Value.Parameter
  @JsonValue
  public abstract String authHeader();

  public static AuthHeader valueOf(String authHeader) {
    if (authHeader.startsWith("Bearer ")) {
      return ImmutableAuthHeader.of(authHeader);
    }
    return ImmutableAuthHeader.of("Bearer " + authHeader);
  }

  @Override
  public final String toString() {
    return authHeader();
  }
}
