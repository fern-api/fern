package com.fern;

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
public final class TypeReference {
  private final InternalValue value;

  @JsonCreator(
      mode = JsonCreator.Mode.DELEGATING
  )
  private TypeReference(InternalValue value) {
    this.value = value;
  }

  @JsonValue
  InternalValue getInternalValue() {
    return value;
  }

  public static TypeReference named(NamedType value) {
    return new TypeReference(Named.of(value));
  }

  public static TypeReference primitive(PrimitiveType value) {
    return new TypeReference(Primitive.of(value));
  }

  public static TypeReference container(ContainerType value) {
    return new TypeReference(Container.of(value));
  }

  public static TypeReference _void() {
    return new TypeReference(_Void.of());
  }

  public boolean isPrimitive() {
    return value instanceof Primitive;
  }

  public boolean isContainer() {
    return value instanceof Container;
  }

  public boolean isNamed() {
    return value instanceof Named;
  }

  public boolean isVoid() {
    return value instanceof _Void;
  }

  public Optional<NamedType> getNamed() {
    if (isNamed()) {
      return Optional.of(((Named) value).named());
    }
    return Optional.empty();
  }

  public Optional<PrimitiveType> getPrimitive() {
    if (isPrimitive()) {
      return Optional.of(((Primitive) value).primitive());
    }
    return Optional.empty();
  }

  public Optional<ContainerType> getContainer() {
    if (isContainer()) {
      return Optional.of(((Container) value).container());
    }
    return Optional.empty();
  }

  public <T> T accept(Visitor<T> visitor) {
    return value.accept(visitor);
  }

  public interface Visitor<T> {
    T visitNamed(NamedType value);

    T visitPrimitive(PrimitiveType value);

    T visitContainer(ContainerType value);

    T visitVoid();

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
      @JsonSubTypes.Type(value = Primitive.class, name = "primitive"),
      @JsonSubTypes.Type(value = Container.class, name = "container"),
      @JsonSubTypes.Type(value = Named.class, name = "named"),
      @JsonSubTypes.Type(value = _Void.class, name = "void")
  })
  @JsonIgnoreProperties(
      ignoreUnknown = true
  )
  private interface InternalValue {
    <T> T accept(Visitor<T> visitor);
  }

  @Value.Immutable
  @JsonTypeName("primitive")
  @JsonDeserialize(
      as = ImmutableTypeReference.Primitive.class
  )
  interface Primitive extends InternalValue {
    PrimitiveType primitive();

    @Override
    default <T> T accept(Visitor<T> visitor) {
      return visitor.visitPrimitive(primitive());
    }

    static Primitive of(PrimitiveType value) {
      return ImmutableTypeReference.Primitive.builder().primitive(value).build();
    }
  }

  @Value.Immutable
  @JsonTypeName("container")
  @JsonDeserialize(
      as = ImmutableTypeReference.Container.class
  )
  interface Container extends InternalValue {
    ContainerType container();

    @Override
    default <T> T accept(Visitor<T> visitor) {
      return visitor.visitContainer(container());
    }

    static Container of(ContainerType value) {
      return ImmutableTypeReference.Container.builder().container(value).build();
    }
  }

  @Value.Immutable
  @JsonTypeName("named")
  @JsonDeserialize(
      as = ImmutableTypeReference.Named.class
  )
  interface Named extends InternalValue {
    @JsonValue
    NamedType named();

    @Override
    default <T> T accept(Visitor<T> visitor) {
      return visitor.visitNamed(named());
    }

    static Named of(NamedType value) {
      return ImmutableTypeReference.Named.builder().named(value).build();
    }
  }

  @Value.Immutable
  @JsonTypeName("void")
  @JsonDeserialize(
      as = ImmutableTypeReference._Void.class
  )
  interface _Void extends InternalValue {
    @Override
    default <T> T accept(Visitor<T> visitor) {
      return visitor.visitVoid();
    }

    static _Void of() {
      return ImmutableTypeReference._Void.builder().build();
    }
  }

  @Value.Immutable
  @JsonDeserialize(
      as = ImmutableTypeReference.Unknown.class
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
