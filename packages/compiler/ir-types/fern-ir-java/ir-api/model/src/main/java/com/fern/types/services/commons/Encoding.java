package com.fern.types.services.commons;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonTypeName;
import com.fasterxml.jackson.annotation.JsonValue;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import java.lang.Object;
import java.lang.Override;
import java.lang.String;
import java.util.Map;
import java.util.Optional;
import org.immutables.value.Value;

@Value.Enclosing
public final class Encoding {
  private final InternalValue value;

  @JsonCreator(
      mode = JsonCreator.Mode.DELEGATING
  )
  private Encoding(InternalValue value) {
    this.value = value;
  }

  @JsonValue
  InternalValue getInternalValue() {
    return value;
  }

  public static Encoding json() {
    return new Encoding(InternalJsonValue.of());
  }

  public static Encoding custom(CustomWireMessageEncoding value) {
    return new Encoding(InternalCustomValue.of(value));
  }

  public boolean isCustom() {
    return value instanceof InternalCustomValue;
  }

  public boolean isJson() {
    return value instanceof InternalJsonValue;
  }

  public Optional<CustomWireMessageEncoding> getCustom() {
    if (isCustom()) {
      return Optional.of(((InternalCustomValue) value).custom());
    }
    return Optional.empty();
  }

  public <T> T visit(Visitor<T> visitor) {
    return value.visit(visitor);
  }

  public interface Visitor<T> {
    T visitJson();

    T visitCustom(CustomWireMessageEncoding value);

    T visitUnknown(String unknownType);
  }

  @JsonTypeInfo(
      use = JsonTypeInfo.Id.NAME,
      include = JsonTypeInfo.As.EXISTING_PROPERTY,
      property = "_type",
      visible = true,
      defaultImpl = Unknown.class
  )
  @JsonSubTypes({
      @JsonSubTypes.Type(value = InternalCustomValue.class, name = "custom"),
      @JsonSubTypes.Type(value = InternalJsonValue.class, name = "json")
  })
  @JsonIgnoreProperties(
      ignoreUnknown = true
  )
  private interface InternalValue {
    <T> T visit(Visitor<T> visitor);
  }

  @Value.Immutable
  @JsonTypeName("custom")
  @JsonDeserialize(
      as = ImmutableEncoding.InternalCustomValue.class
  )
  interface InternalCustomValue extends InternalValue {
    @JsonValue
    CustomWireMessageEncoding custom();

    @Override
    default <T> T visit(Visitor<T> visitor) {
      return visitor.visitCustom(custom());
    }

    static InternalCustomValue of(CustomWireMessageEncoding value) {
      return ImmutableEncoding.InternalCustomValue.builder().custom(value).build();
    }
  }

  @Value.Immutable
  @JsonTypeName("json")
  @JsonDeserialize(
      as = ImmutableEncoding.InternalJsonValue.class
  )
  interface InternalJsonValue extends InternalValue {
    @Override
    default <T> T visit(Visitor<T> visitor) {
      return visitor.visitJson();
    }

    static InternalJsonValue of() {
      return ImmutableEncoding.InternalJsonValue.builder().build();
    }
  }

  @Value.Immutable
  @JsonDeserialize(
      as = ImmutableEncoding.Unknown.class
  )
  interface Unknown extends InternalValue {
    @JsonValue
    Map<String, Object> value();

    default String type() {
      return value().get("type").toString();
    }

    @Override
    default <T> T visit(Visitor<T> visitor) {
      return visitor.visitUnknown(type());
    }
  }
}
