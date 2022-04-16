package com.fern;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
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
public final class Type {
  private final InternalValue value;

  @JsonCreator(
      mode = JsonCreator.Mode.DELEGATING
  )
  private Type(InternalValue value) {
    this.value = value;
  }

  @JsonValue
  InternalValue getInternalValue() {
    return value;
  }

  public static Type _object(ObjectTypeDefinition value) {
    return new Type(_Object.of(value));
  }

  public static Type union(UnionTypeDefinition value) {
    return new Type(Union.of(value));
  }

  public static Type alias(AliasTypeDefinition value) {
    return new Type(Alias.of(value));
  }

  public static Type _enum(EnumTypeDefinition value) {
    return new Type(_Enum.of(value));
  }

  public boolean isEnum() {
    return value instanceof _Enum;
  }

  public boolean isAlias() {
    return value instanceof Alias;
  }

  public boolean isUnion() {
    return value instanceof Union;
  }

  public boolean isObject() {
    return value instanceof _Object;
  }

  public Optional<ObjectTypeDefinition> getObject() {
    if (isObject()) {
      return Optional.of(((_Object) value)._object());
    }
    return Optional.empty();
  }

  public Optional<UnionTypeDefinition> getUnion() {
    if (isUnion()) {
      return Optional.of(((Union) value).union());
    }
    return Optional.empty();
  }

  public Optional<AliasTypeDefinition> getAlias() {
    if (isAlias()) {
      return Optional.of(((Alias) value).alias());
    }
    return Optional.empty();
  }

  public Optional<EnumTypeDefinition> getEnum() {
    if (isEnum()) {
      return Optional.of(((_Enum) value)._enum());
    }
    return Optional.empty();
  }

  public <T> T accept(Visitor<T> visitor) {
    return value.accept(visitor);
  }

  public interface Visitor<T> {
    T visitObject(ObjectTypeDefinition value);

    T visitUnion(UnionTypeDefinition value);

    T visitAlias(AliasTypeDefinition value);

    T visitEnum(EnumTypeDefinition value);

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
      @JsonSubTypes.Type(value = _Enum.class, name = "enum"),
      @JsonSubTypes.Type(value = Alias.class, name = "alias"),
      @JsonSubTypes.Type(value = Union.class, name = "union"),
      @JsonSubTypes.Type(value = _Object.class, name = "object")
  })
  @JsonIgnoreProperties(
      ignoreUnknown = true
  )
  private interface InternalValue {
    <T> T accept(Visitor<T> visitor);
  }

  @Value.Immutable
  @JsonTypeName("enum")
  @JsonDeserialize(
      as = ImmutableType._Enum.class
  )
  interface _Enum extends InternalValue {
    @JsonProperty("enum")
    @JsonValue
    EnumTypeDefinition _enum();

    @Override
    default <T> T accept(Visitor<T> visitor) {
      return visitor.visitEnum(_enum());
    }

    static _Enum of(EnumTypeDefinition value) {
      return ImmutableType._Enum.builder()._enum(value).build();
    }
  }

  @Value.Immutable
  @JsonTypeName("alias")
  @JsonDeserialize(
      as = ImmutableType.Alias.class
  )
  interface Alias extends InternalValue {
    @JsonValue
    AliasTypeDefinition alias();

    @Override
    default <T> T accept(Visitor<T> visitor) {
      return visitor.visitAlias(alias());
    }

    static Alias of(AliasTypeDefinition value) {
      return ImmutableType.Alias.builder().alias(value).build();
    }
  }

  @Value.Immutable
  @JsonTypeName("union")
  @JsonDeserialize(
      as = ImmutableType.Union.class
  )
  interface Union extends InternalValue {
    @JsonValue
    UnionTypeDefinition union();

    @Override
    default <T> T accept(Visitor<T> visitor) {
      return visitor.visitUnion(union());
    }

    static Union of(UnionTypeDefinition value) {
      return ImmutableType.Union.builder().union(value).build();
    }
  }

  @Value.Immutable
  @JsonTypeName("object")
  @JsonDeserialize(
      as = ImmutableType._Object.class
  )
  interface _Object extends InternalValue {
    @JsonProperty("object")
    @JsonValue
    ObjectTypeDefinition _object();

    @Override
    default <T> T accept(Visitor<T> visitor) {
      return visitor.visitObject(_object());
    }

    static _Object of(ObjectTypeDefinition value) {
      return ImmutableType._Object.builder()._object(value).build();
    }
  }

  @Value.Immutable
  @JsonDeserialize(
      as = ImmutableType.Unknown.class
  )
  interface Unknown extends InternalValue {
    @JsonValue
    Map<String, Object> value();

    default String type() {
      return value().get("type").toString();
    }

    @Override
    default <T> T accept(Visitor<T> visitor) {
      return visitor.visitUnknown(type());
    }
  }
}
