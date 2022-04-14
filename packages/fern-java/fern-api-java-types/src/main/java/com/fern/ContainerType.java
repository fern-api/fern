package com.fern;

import com.fasterxml.jackson.annotation.*;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fern.immutables.StagedBuilderStyle;
import org.immutables.value.Value;

@Value.Enclosing
public final class ContainerType {

    private final Base value;

    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    private ContainerType(Base value) {
        this.value = value;
    }

    @JsonValue
    private Base getValue() {
        return value;
    }

    public static ContainerType map(MapType value) {
        return new ContainerType(Map.builder().map(value).build());
    }

    public static ContainerType list(TypeReference value) {
        return new ContainerType(List.builder().list(value).build());
    }

    public static ContainerType set(TypeReference value) {
        return new ContainerType(Set.builder().set(value).build());
    }

    public static ContainerType optional(TypeReference value) {
        return new ContainerType(Optional.builder().optional(value).build());
    }

    public boolean isMap() {
        return value instanceof Map;
    }

    public boolean isList() {
        return value instanceof List;
    }

    public boolean isSet() {
        return value instanceof Set;
    }

    public boolean isOptional() {
        return value instanceof Optional;
    }

    public java.util.Optional<MapType> getMap() throws ClassCastException {
        if (isMap()) {
            return java.util.Optional.of(((Map) value).map());
        }
        return java.util.Optional.empty();
    }

    public java.util.Optional<TypeReference> getList() throws ClassCastException {
        if (isList()) {
            return java.util.Optional.of(((List) value).list());
        }
        return java.util.Optional.empty();
    }

    public java.util.Optional<TypeReference> getSet() throws ClassCastException {
        if (isSet()) {
            return java.util.Optional.of(((Set) value).set());
        }
        return java.util.Optional.empty();
    }

    public java.util.Optional<TypeReference> getOptional() throws ClassCastException {
        if (isOptional()) {
            return java.util.Optional.of(((Optional) value).optional());
        }
        return java.util.Optional.empty();
    }

    public <T> T accept(Visitor<T> visitor) {
        return value.accept(visitor);
    }

    public interface Visitor<T> {
        T visitMap(MapType value);

        T visitList(TypeReference value);

        T visitSet(TypeReference value);

        T visitOptional(TypeReference value);

        T visitUnknown(String unknownType);
    }

    @JsonTypeInfo(
            use = JsonTypeInfo.Id.NAME,
            include = JsonTypeInfo.As.PROPERTY,
            property = "type",
            visible = true,
            defaultImpl = Unknown.class)
    @JsonSubTypes({
            @JsonSubTypes.Type(value = Map.class, name = "map"),
            @JsonSubTypes.Type(value = List.class, name = "list"),
            @JsonSubTypes.Type(value = Set.class, name = "set"),
            @JsonSubTypes.Type(value = Optional.class, name = "optional")
    })
    @JsonIgnoreProperties(ignoreUnknown = true)
    private interface Base {
        <T> T accept(Visitor<T> visitor);
    }

    @Value.Immutable
    @JsonTypeName("map")
    @JsonDeserialize(as = ImmutableContainerType.Map.class)
    interface Map extends Base {

        @JsonValue
        MapType map();

        @Override
        default <T> T accept(Visitor<T> visitor) {
            return visitor.visitMap(map());
        }

        static ImmutableContainerType.Map.Builder builder() {
            return ImmutableContainerType.Map.builder();
        }
    }

    @Value.Immutable
    @JsonTypeName("list")
    @JsonDeserialize(as = ImmutableContainerType.List.class)
    interface List extends Base {

        TypeReference list();

        @Override
        default <T> T accept(Visitor<T> visitor) {
            return visitor.visitList(list());
        }

        static ImmutableContainerType.List.Builder builder() {
            return ImmutableContainerType.List.builder();
        }
    }

    @Value.Immutable
    @JsonTypeName("set")
    @JsonDeserialize(as = ImmutableContainerType.Set.class)
    public interface Set extends Base {

        TypeReference set();

        @Override
        default <T> T accept(Visitor<T> visitor) {
            return visitor.visitSet(set());
        }

        static ImmutableContainerType.Set.Builder builder() {
            return ImmutableContainerType.Set.builder();
        }
    }

    @Value.Immutable
    @JsonTypeName("optional")
    @JsonDeserialize(as = ImmutableContainerType.Optional.class)
    public interface Optional extends Base {

        TypeReference optional();

        @Override
        default <T> T accept(Visitor<T> visitor) {
            return visitor.visitOptional(optional());
        }

        static ImmutableContainerType.Optional.Builder builder() {
            return ImmutableContainerType.Optional.builder();
        }
    }

    @Value.Immutable
    @JsonDeserialize(as = ImmutableContainerType.Unknown.class)
    interface Unknown extends Base {

        @JsonValue
        java.util.Map<String, Object> value();

        default String type() {
            return value().get("type").toString();
        }

        @Override
        default <T> T accept(Visitor<T> visitor) {
            return visitor.visitUnknown(type());
        }

        static ImmutableContainerType.Unknown.Builder builder() {
            return ImmutableContainerType.Unknown.builder();
        }
    }
}
