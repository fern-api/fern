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

  public static TypeReference container(ContainerType value) {
    return new TypeReference(InternalContainerValue.of(value));
  }

  public static TypeReference named(NamedType value) {
    return new TypeReference(InternalNamedValue.of(value));
  }

  public static TypeReference primitive(PrimitiveType value) {
    return new TypeReference(InternalPrimitiveValue.of(value));
  }

  public static TypeReference _void() {
    return new TypeReference(InternalVoidValue.of());
  }

  public boolean isContainer() {
    return value instanceof InternalContainerValue;
  }

  public boolean isVoid() {
    return value instanceof InternalVoidValue;
  }

  public boolean isNamed() {
    return value instanceof InternalNamedValue;
  }

  public boolean isPrimitive() {
    return value instanceof InternalPrimitiveValue;
  }

  public Optional<ContainerType> getContainer() {
    if (isContainer()) {
      return Optional.of(((InternalContainerValue) value).container());
    }
    return Optional.empty();
  }

  public Optional<NamedType> getNamed() {
    if (isNamed()) {
      return Optional.of(((InternalNamedValue) value).named());
    }
    return Optional.empty();
  }

  public Optional<PrimitiveType> getPrimitive() {
    if (isPrimitive()) {
      return Optional.of(((InternalPrimitiveValue) value).primitive());
    }
    return Optional.empty();
  }

  public <T> T visit(Visitor<T> visitor) {
    return value.visit(visitor);
  }

  public interface Visitor<T> {
    T visitContainer(ContainerType value);

    T visitNamed(NamedType value);

    T visitPrimitive(PrimitiveType value);

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
      @JsonSubTypes.Type(value = InternalContainerValue.class, name = "container"),
      @JsonSubTypes.Type(value = InternalVoidValue.class, name = "void"),
      @JsonSubTypes.Type(value = InternalNamedValue.class, name = "named"),
      @JsonSubTypes.Type(value = InternalPrimitiveValue.class, name = "primitive")
  })
  @JsonIgnoreProperties(
      ignoreUnknown = true
  )
  private interface InternalValue {
    <T> T visit(Visitor<T> visitor);
  }

  @Value.Immutable
  @JsonTypeName("container")
  @JsonDeserialize(
      as = ImmutableTypeReference.InternalContainerValue.class
  )
  interface InternalContainerValue extends InternalValue {
    ContainerType container();

    @Override
    default <T> T visit(Visitor<T> visitor) {
      return visitor.visitContainer(container());
    }

    static InternalContainerValue of(ContainerType value) {
      return ImmutableTypeReference.InternalContainerValue.builder().container(value).build();
    }
  }

  @Value.Immutable
  @JsonTypeName("void")
  @JsonDeserialize(
      as = ImmutableTypeReference.InternalVoidValue.class
  )
  interface InternalVoidValue extends InternalValue {
    @Override
    default <T> T visit(Visitor<T> visitor) {
      return visitor.visitVoid();
    }

    static InternalVoidValue of() {
      return ImmutableTypeReference.InternalVoidValue.builder().build();
    }
  }

  @Value.Immutable
  @JsonTypeName("named")
  @JsonDeserialize(
      as = ImmutableTypeReference.InternalNamedValue.class
  )
  interface InternalNamedValue extends InternalValue {
    @JsonValue
    NamedType named();

    @Override
    default <T> T visit(Visitor<T> visitor) {
      return visitor.visitNamed(named());
    }

    static InternalNamedValue of(NamedType value) {
      return ImmutableTypeReference.InternalNamedValue.builder().named(value).build();
    }
  }

  @Value.Immutable
  @JsonTypeName("primitive")
  @JsonDeserialize(
      as = ImmutableTypeReference.InternalPrimitiveValue.class
  )
  interface InternalPrimitiveValue extends InternalValue {
    PrimitiveType primitive();

    @Override
    default <T> T visit(Visitor<T> visitor) {
      return visitor.visitPrimitive(primitive());
    }

    static InternalPrimitiveValue of(PrimitiveType value) {
      return ImmutableTypeReference.InternalPrimitiveValue.builder().primitive(value).build();
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
    default <T> T visit(Visitor<T> visitor) {
      return visitor.visitUnknown(type());
    }
  }
}
