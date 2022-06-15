package com.fern.types.types;

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
public final class ContainerType {
  private final InternalValue value;

  @JsonCreator(
      mode = JsonCreator.Mode.DELEGATING
  )
  private ContainerType(InternalValue value) {
    this.value = value;
  }

  @JsonValue
  InternalValue getInternalValue() {
    return value;
  }

  public static ContainerType list(TypeReference value) {
    return new ContainerType(InternalListValue.of(value));
  }

  public static ContainerType map(MapType value) {
    return new ContainerType(InternalMapValue.of(value));
  }

  public static ContainerType optional(TypeReference value) {
    return new ContainerType(InternalOptionalValue.of(value));
  }

  public static ContainerType set(TypeReference value) {
    return new ContainerType(InternalSetValue.of(value));
  }

  public boolean isList() {
    return value instanceof InternalListValue;
  }

  public boolean isOptional() {
    return value instanceof InternalOptionalValue;
  }

  public boolean isSet() {
    return value instanceof InternalSetValue;
  }

  public boolean isMap() {
    return value instanceof InternalMapValue;
  }

  public Optional<TypeReference> getList() {
    if (isList()) {
      return Optional.of(((InternalListValue) value).list());
    }
    return Optional.empty();
  }

  public Optional<MapType> getMap() {
    if (isMap()) {
      return Optional.of(((InternalMapValue) value).map());
    }
    return Optional.empty();
  }

  public Optional<TypeReference> getOptional() {
    if (isOptional()) {
      return Optional.of(((InternalOptionalValue) value).optional());
    }
    return Optional.empty();
  }

  public Optional<TypeReference> getSet() {
    if (isSet()) {
      return Optional.of(((InternalSetValue) value).set());
    }
    return Optional.empty();
  }

  public <T> T visit(Visitor<T> visitor) {
    return value.visit(visitor);
  }

  public interface Visitor<T> {
    T visitList(TypeReference value);

    T visitMap(MapType value);

    T visitOptional(TypeReference value);

    T visitSet(TypeReference value);

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
      @JsonSubTypes.Type(value = InternalListValue.class, name = "list"),
      @JsonSubTypes.Type(value = InternalOptionalValue.class, name = "optional"),
      @JsonSubTypes.Type(value = InternalSetValue.class, name = "set"),
      @JsonSubTypes.Type(value = InternalMapValue.class, name = "map")
  })
  @JsonIgnoreProperties(
      ignoreUnknown = true
  )
  private interface InternalValue {
    <T> T visit(Visitor<T> visitor);
  }

  @Value.Immutable
  @JsonTypeName("list")
  @JsonDeserialize(
      as = ImmutableContainerType.InternalListValue.class
  )
  interface InternalListValue extends InternalValue {
    TypeReference list();

    @Override
    default <T> T visit(Visitor<T> visitor) {
      return visitor.visitList(list());
    }

    static InternalListValue of(TypeReference value) {
      return ImmutableContainerType.InternalListValue.builder().list(value).build();
    }
  }

  @Value.Immutable
  @JsonTypeName("optional")
  @JsonDeserialize(
      as = ImmutableContainerType.InternalOptionalValue.class
  )
  interface InternalOptionalValue extends InternalValue {
    TypeReference optional();

    @Override
    default <T> T visit(Visitor<T> visitor) {
      return visitor.visitOptional(optional());
    }

    static InternalOptionalValue of(TypeReference value) {
      return ImmutableContainerType.InternalOptionalValue.builder().optional(value).build();
    }
  }

  @Value.Immutable
  @JsonTypeName("set")
  @JsonDeserialize(
      as = ImmutableContainerType.InternalSetValue.class
  )
  interface InternalSetValue extends InternalValue {
    TypeReference set();

    @Override
    default <T> T visit(Visitor<T> visitor) {
      return visitor.visitSet(set());
    }

    static InternalSetValue of(TypeReference value) {
      return ImmutableContainerType.InternalSetValue.builder().set(value).build();
    }
  }

  @Value.Immutable
  @JsonTypeName("map")
  @JsonDeserialize(
      as = ImmutableContainerType.InternalMapValue.class
  )
  interface InternalMapValue extends InternalValue {
    @JsonValue
    MapType map();

    @Override
    default <T> T visit(Visitor<T> visitor) {
      return visitor.visitMap(map());
    }

    static InternalMapValue of(MapType value) {
      return ImmutableContainerType.InternalMapValue.builder().map(value).build();
    }
  }

  @Value.Immutable
  @JsonDeserialize(
      as = ImmutableContainerType.Unknown.class
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
