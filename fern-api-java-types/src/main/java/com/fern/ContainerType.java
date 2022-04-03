package com.fern;

import com.fasterxml.jackson.annotation.*;
import com.fern.immutables.StagedImmutablesStyle;
import org.immutables.value.Value;

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

    @JsonTypeInfo(
            use = JsonTypeInfo.Id.NAME,
            include = JsonTypeInfo.As.EXISTING_PROPERTY,
            property = "type",
            visible = true,
            defaultImpl = Unknown.class)
    @JsonSubTypes({
            @JsonSubTypes.Type(Map.class),
            @JsonSubTypes.Type(List.class),
            @JsonSubTypes.Type(Set.class),
            @JsonSubTypes.Type(Optional.class)
    })
    @JsonIgnoreProperties(ignoreUnknown = true)
    private interface Base {
        <T> T accept(Visitor<T> visitor);
    }

    @Value.Immutable
    @JsonTypeName("map")
    @StagedImmutablesStyle
    interface Map extends Base {

        @JsonValue
        MapType map();

        @Override
        default <T> T accept(Visitor<T> visitor) {
            return visitor.visitMap(map());
        }

        static ImmutableMap.MapBuildStage builder() {
            return ImmutableMap.builder();
        }
    }

    @Value.Immutable
    @JsonTypeName("list")
    @StagedImmutablesStyle
    interface List extends Base {

        @JsonValue
        TypeReference list();

        @Override
        default <T> T accept(Visitor<T> visitor) {
            return visitor.visitList(list());
        }

        static ImmutableList.ListBuildStage builder() {
            return ImmutableList.builder();
        }
    }

    @Value.Immutable
    @JsonTypeName("set")
    @StagedImmutablesStyle
    public interface Set extends Base {

        @JsonValue
        TypeReference set();

        @Override
        default <T> T accept(Visitor<T> visitor) {
            return visitor.visitSet(set());
        }

        static ImmutableSet.SetBuildStage builder() {
            return ImmutableSet.builder();
        }
    }

    @Value.Immutable
    @JsonTypeName("optional")
    @StagedImmutablesStyle
    public interface Optional extends Base {

        @JsonValue
        TypeReference optional();

        @Override
        default <T> T accept(Visitor<T> visitor) {
            return visitor.visitOptional(optional());
        }

        static ImmutableOptional.OptionalBuildStage builder() {
            return ImmutableOptional.builder();
        }
    }

    @Value.Immutable
    @StagedImmutablesStyle
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

        static ImmutableUnknown.Builder builder() {
            return ImmutableUnknown.builder();
        }
    }

    public interface Visitor<T> {
        T visitMap(MapType value);

        T visitList(TypeReference value);

        T visitSet(TypeReference value);

        T visitOptional(TypeReference value);

        T visitUnknown(String unknownType);
    }
}
