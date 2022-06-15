package com.fern.types.types;

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

  public static Type alias(AliasTypeDefinition value) {
    return new Type(InternalAliasValue.of(value));
  }

  public static Type _enum(EnumTypeDefinition value) {
    return new Type(InternalEnumValue.of(value));
  }

  public static Type _object(ObjectTypeDefinition value) {
    return new Type(InternalObjectValue.of(value));
  }

  public static Type union(UnionTypeDefinition value) {
    return new Type(InternalUnionValue.of(value));
  }

  public boolean isAlias() {
    return value instanceof InternalAliasValue;
  }

  public boolean isUnion() {
    return value instanceof InternalUnionValue;
  }

  public boolean isEnum() {
    return value instanceof InternalEnumValue;
  }

  public boolean isObject() {
    return value instanceof InternalObjectValue;
  }

  public Optional<AliasTypeDefinition> getAlias() {
    if (isAlias()) {
      return Optional.of(((InternalAliasValue) value).alias());
    }
    return Optional.empty();
  }

  public Optional<EnumTypeDefinition> getEnum() {
    if (isEnum()) {
      return Optional.of(((InternalEnumValue) value)._enum());
    }
    return Optional.empty();
  }

  public Optional<ObjectTypeDefinition> getObject() {
    if (isObject()) {
      return Optional.of(((InternalObjectValue) value)._object());
    }
    return Optional.empty();
  }

  public Optional<UnionTypeDefinition> getUnion() {
    if (isUnion()) {
      return Optional.of(((InternalUnionValue) value).union());
    }
    return Optional.empty();
  }

  public <T> T visit(Visitor<T> visitor) {
    return value.visit(visitor);
  }

  public interface Visitor<T> {
    T visitAlias(AliasTypeDefinition value);

    T visitEnum(EnumTypeDefinition value);

    T visitObject(ObjectTypeDefinition value);

    T visitUnion(UnionTypeDefinition value);

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
      @JsonSubTypes.Type(value = InternalAliasValue.class, name = "alias"),
      @JsonSubTypes.Type(value = InternalUnionValue.class, name = "union"),
      @JsonSubTypes.Type(value = InternalEnumValue.class, name = "enum"),
      @JsonSubTypes.Type(value = InternalObjectValue.class, name = "object")
  })
  @JsonIgnoreProperties(
      ignoreUnknown = true
  )
  private interface InternalValue {
    <T> T visit(Visitor<T> visitor);
  }

  @Value.Immutable
  @JsonTypeName("alias")
  @JsonDeserialize(
      as = ImmutableType.InternalAliasValue.class
  )
  interface InternalAliasValue extends InternalValue {
    @JsonValue
    AliasTypeDefinition alias();

    @Override
    default <T> T visit(Visitor<T> visitor) {
      return visitor.visitAlias(alias());
    }

    static InternalAliasValue of(AliasTypeDefinition value) {
      return ImmutableType.InternalAliasValue.builder().alias(value).build();
    }
  }

  @Value.Immutable
  @JsonTypeName("union")
  @JsonDeserialize(
      as = ImmutableType.InternalUnionValue.class
  )
  interface InternalUnionValue extends InternalValue {
    @JsonValue
    UnionTypeDefinition union();

    @Override
    default <T> T visit(Visitor<T> visitor) {
      return visitor.visitUnion(union());
    }

    static InternalUnionValue of(UnionTypeDefinition value) {
      return ImmutableType.InternalUnionValue.builder().union(value).build();
    }
  }

  @Value.Immutable
  @JsonTypeName("enum")
  @JsonDeserialize(
      as = ImmutableType.InternalEnumValue.class
  )
  interface InternalEnumValue extends InternalValue {
    @JsonProperty("enum")
    @JsonValue
    EnumTypeDefinition _enum();

    @Override
    default <T> T visit(Visitor<T> visitor) {
      return visitor.visitEnum(_enum());
    }

    static InternalEnumValue of(EnumTypeDefinition value) {
      return ImmutableType.InternalEnumValue.builder()._enum(value).build();
    }
  }

  @Value.Immutable
  @JsonTypeName("object")
  @JsonDeserialize(
      as = ImmutableType.InternalObjectValue.class
  )
  interface InternalObjectValue extends InternalValue {
    @JsonProperty("object")
    @JsonValue
    ObjectTypeDefinition _object();

    @Override
    default <T> T visit(Visitor<T> visitor) {
      return visitor.visitObject(_object());
    }

    static InternalObjectValue of(ObjectTypeDefinition value) {
      return ImmutableType.InternalObjectValue.builder()._object(value).build();
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
    default <T> T visit(Visitor<T> visitor) {
      return visitor.visitUnknown(type());
    }
  }
}
