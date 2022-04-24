package com.types;

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
    return new ContainerType(List.of(value));
  }

  public static ContainerType map(MapType value) {
    return new ContainerType(Map.of(value));
  }

  public static ContainerType optional(TypeReference value) {
    return new ContainerType(Optional.of(value));
  }

  public static ContainerType set(TypeReference value) {
    return new ContainerType(Set.of(value));
  }

  public boolean isMap() {
    return value instanceof Map;
  }

  public boolean isSet() {
    return value instanceof Set;
  }

  public boolean isList() {
    return value instanceof List;
  }

  public boolean isOptional() {
    return value instanceof Optional;
  }

  public java.util.Optional<TypeReference> getList() {
    if (isList()) {
      return java.util.Optional.of(((List) value).list());
    }
    return java.util.Optional.empty();
  }

  public java.util.Optional<MapType> getMap() {
    if (isMap()) {
      return java.util.Optional.of(((Map) value).map());
    }
    return java.util.Optional.empty();
  }

  public java.util.Optional<TypeReference> getOptional() {
    if (isOptional()) {
      return java.util.Optional.of(((Optional) value).optional());
    }
    return java.util.Optional.empty();
  }

  public java.util.Optional<TypeReference> getSet() {
    if (isSet()) {
      return java.util.Optional.of(((Set) value).set());
    }
    return java.util.Optional.empty();
  }

  public <T> T accept(Visitor<T> visitor) {
    return value.accept(visitor);
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
      @JsonSubTypes.Type(value = Map.class, name = "map"),
      @JsonSubTypes.Type(value = Set.class, name = "set"),
      @JsonSubTypes.Type(value = List.class, name = "list"),
      @JsonSubTypes.Type(value = Optional.class, name = "optional")
  })
  @JsonIgnoreProperties(
      ignoreUnknown = true
  )
  private interface InternalValue {
    <T> T accept(Visitor<T> visitor);
  }

  @Value.Immutable
  @JsonTypeName("map")
  @JsonDeserialize(
      as = ImmutableContainerType.Map.class
  )
  interface Map extends InternalValue {
    @JsonValue
    MapType map();

    @Override
    default <T> T accept(Visitor<T> visitor) {
      return visitor.visitMap(map());
    }

    static Map of(MapType value) {
      return ImmutableContainerType.Map.builder().map(value).build();
    }
  }

  @Value.Immutable
  @JsonTypeName("set")
  @JsonDeserialize(
      as = ImmutableContainerType.Set.class
  )
  interface Set extends InternalValue {
    TypeReference set();

    @Override
    default <T> T accept(Visitor<T> visitor) {
      return visitor.visitSet(set());
    }

    static Set of(TypeReference value) {
      return ImmutableContainerType.Set.builder().set(value).build();
    }
  }

  @Value.Immutable
  @JsonTypeName("list")
  @JsonDeserialize(
      as = ImmutableContainerType.List.class
  )
  interface List extends InternalValue {
    TypeReference list();

    @Override
    default <T> T accept(Visitor<T> visitor) {
      return visitor.visitList(list());
    }

    static List of(TypeReference value) {
      return ImmutableContainerType.List.builder().list(value).build();
    }
  }

  @Value.Immutable
  @JsonTypeName("optional")
  @JsonDeserialize(
      as = ImmutableContainerType.Optional.class
  )
  interface Optional extends InternalValue {
    TypeReference optional();

    @Override
    default <T> T accept(Visitor<T> visitor) {
      return visitor.visitOptional(optional());
    }

    static Optional of(TypeReference value) {
      return ImmutableContainerType.Optional.builder().optional(value).build();
    }
  }

  @Value.Immutable
  @JsonDeserialize(
      as = ImmutableContainerType.Unknown.class
  )
  interface Unknown extends InternalValue {
    @JsonValue
    java.util.Map<String, Object> value();

    default String type() {
      return value().get("type").toString();
    }

    @Override
    default <T> T accept(Visitor<T> visitor) {
      return visitor.visitUnknown(type());
    }
  }
}
