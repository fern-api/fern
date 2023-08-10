package com.seed.api.resources.types.object.types;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_EMPTY)
@JsonDeserialize(builder = ObjectWithOptionalField.Builder.class)
public final class ObjectWithOptionalField {
    private final Optional<String> string;

    private final Optional<Integer> integer;

    private final Optional<Long> long_;

    private final Optional<Double> double_;

    private final Optional<Boolean> bool;

    private final Optional<OffsetDateTime> datetime;

    private final Optional<String> date;

    private final Optional<UUID> uuid;

    private final Optional<String> base64;

    private final Optional<List<String>> list;

    private final Optional<Set<String>> set;

    private final Optional<Map<Integer, String>> map;

    private ObjectWithOptionalField(
            Optional<String> string,
            Optional<Integer> integer,
            Optional<Long> long_,
            Optional<Double> double_,
            Optional<Boolean> bool,
            Optional<OffsetDateTime> datetime,
            Optional<String> date,
            Optional<UUID> uuid,
            Optional<String> base64,
            Optional<List<String>> list,
            Optional<Set<String>> set,
            Optional<Map<Integer, String>> map) {
        this.string = string;
        this.integer = integer;
        this.long_ = long_;
        this.double_ = double_;
        this.bool = bool;
        this.datetime = datetime;
        this.date = date;
        this.uuid = uuid;
        this.base64 = base64;
        this.list = list;
        this.set = set;
        this.map = map;
    }

    @JsonProperty("string")
    public Optional<String> getString() {
        return string;
    }

    @JsonProperty("integer")
    public Optional<Integer> getInteger() {
        return integer;
    }

    @JsonProperty("long")
    public Optional<Long> getLong() {
        return long_;
    }

    @JsonProperty("double")
    public Optional<Double> getDouble() {
        return double_;
    }

    @JsonProperty("bool")
    public Optional<Boolean> getBool() {
        return bool;
    }

    @JsonProperty("datetime")
    public Optional<OffsetDateTime> getDatetime() {
        return datetime;
    }

    @JsonProperty("date")
    public Optional<String> getDate() {
        return date;
    }

    @JsonProperty("uuid")
    public Optional<UUID> getUuid() {
        return uuid;
    }

    @JsonProperty("base64")
    public Optional<String> getBase64() {
        return base64;
    }

    @JsonProperty("list")
    public Optional<List<String>> getList() {
        return list;
    }

    @JsonProperty("set")
    public Optional<Set<String>> getSet() {
        return set;
    }

    @JsonProperty("map")
    public Optional<Map<Integer, String>> getMap() {
        return map;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) return true;
        return other instanceof ObjectWithOptionalField && equalTo((ObjectWithOptionalField) other);
    }

    private boolean equalTo(ObjectWithOptionalField other) {
        return string.equals(other.string)
                && integer.equals(other.integer)
                && long_.equals(other.long_)
                && double_.equals(other.double_)
                && bool.equals(other.bool)
                && datetime.equals(other.datetime)
                && date.equals(other.date)
                && uuid.equals(other.uuid)
                && base64.equals(other.base64)
                && list.equals(other.list)
                && set.equals(other.set)
                && map.equals(other.map);
    }

    @Override
    public int hashCode() {
        return Objects.hash(
                this.string,
                this.integer,
                this.long_,
                this.double_,
                this.bool,
                this.datetime,
                this.date,
                this.uuid,
                this.base64,
                this.list,
                this.set,
                this.map);
    }

    @Override
    public String toString() {
        return "ObjectWithOptionalField{" + "string: " + string + ", integer: " + integer + ", long_: " + long_
                + ", double_: " + double_ + ", bool: " + bool + ", datetime: " + datetime + ", date: " + date
                + ", uuid: " + uuid + ", base64: " + base64 + ", list: " + list + ", set: " + set + ", map: " + map
                + "}";
    }

    public static Builder builder() {
        return new Builder();
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static final class Builder {
        private Optional<String> string = Optional.empty();

        private Optional<Integer> integer = Optional.empty();

        private Optional<Long> long_ = Optional.empty();

        private Optional<Double> double_ = Optional.empty();

        private Optional<Boolean> bool = Optional.empty();

        private Optional<OffsetDateTime> datetime = Optional.empty();

        private Optional<String> date = Optional.empty();

        private Optional<UUID> uuid = Optional.empty();

        private Optional<String> base64 = Optional.empty();

        private Optional<List<String>> list = Optional.empty();

        private Optional<Set<String>> set = Optional.empty();

        private Optional<Map<Integer, String>> map = Optional.empty();

        private Builder() {}

        public Builder from(ObjectWithOptionalField other) {
            string(other.getString());
            integer(other.getInteger());
            long_(other.getLong());
            double_(other.getDouble());
            bool(other.getBool());
            datetime(other.getDatetime());
            date(other.getDate());
            uuid(other.getUuid());
            base64(other.getBase64());
            list(other.getList());
            set(other.getSet());
            map(other.getMap());
            return this;
        }

        @JsonSetter(value = "string", nulls = Nulls.SKIP)
        public Builder string(Optional<String> string) {
            this.string = string;
            return this;
        }

        public Builder string(String string) {
            this.string = Optional.of(string);
            return this;
        }

        @JsonSetter(value = "integer", nulls = Nulls.SKIP)
        public Builder integer(Optional<Integer> integer) {
            this.integer = integer;
            return this;
        }

        public Builder integer(Integer integer) {
            this.integer = Optional.of(integer);
            return this;
        }

        @JsonSetter(value = "long", nulls = Nulls.SKIP)
        public Builder long_(Optional<Long> long_) {
            this.long_ = long_;
            return this;
        }

        public Builder long_(Long long_) {
            this.long_ = Optional.of(long_);
            return this;
        }

        @JsonSetter(value = "double", nulls = Nulls.SKIP)
        public Builder double_(Optional<Double> double_) {
            this.double_ = double_;
            return this;
        }

        public Builder double_(Double double_) {
            this.double_ = Optional.of(double_);
            return this;
        }

        @JsonSetter(value = "bool", nulls = Nulls.SKIP)
        public Builder bool(Optional<Boolean> bool) {
            this.bool = bool;
            return this;
        }

        public Builder bool(Boolean bool) {
            this.bool = Optional.of(bool);
            return this;
        }

        @JsonSetter(value = "datetime", nulls = Nulls.SKIP)
        public Builder datetime(Optional<OffsetDateTime> datetime) {
            this.datetime = datetime;
            return this;
        }

        public Builder datetime(OffsetDateTime datetime) {
            this.datetime = Optional.of(datetime);
            return this;
        }

        @JsonSetter(value = "date", nulls = Nulls.SKIP)
        public Builder date(Optional<String> date) {
            this.date = date;
            return this;
        }

        public Builder date(String date) {
            this.date = Optional.of(date);
            return this;
        }

        @JsonSetter(value = "uuid", nulls = Nulls.SKIP)
        public Builder uuid(Optional<UUID> uuid) {
            this.uuid = uuid;
            return this;
        }

        public Builder uuid(UUID uuid) {
            this.uuid = Optional.of(uuid);
            return this;
        }

        @JsonSetter(value = "base64", nulls = Nulls.SKIP)
        public Builder base64(Optional<String> base64) {
            this.base64 = base64;
            return this;
        }

        public Builder base64(String base64) {
            this.base64 = Optional.of(base64);
            return this;
        }

        @JsonSetter(value = "list", nulls = Nulls.SKIP)
        public Builder list(Optional<List<String>> list) {
            this.list = list;
            return this;
        }

        public Builder list(List<String> list) {
            this.list = Optional.of(list);
            return this;
        }

        @JsonSetter(value = "set", nulls = Nulls.SKIP)
        public Builder set(Optional<Set<String>> set) {
            this.set = set;
            return this;
        }

        public Builder set(Set<String> set) {
            this.set = Optional.of(set);
            return this;
        }

        @JsonSetter(value = "map", nulls = Nulls.SKIP)
        public Builder map(Optional<Map<Integer, String>> map) {
            this.map = map;
            return this;
        }

        public Builder map(Map<Integer, String> map) {
            this.map = Optional.of(map);
            return this;
        }

        public ObjectWithOptionalField build() {
            return new ObjectWithOptionalField(
                    string, integer, long_, double_, bool, datetime, date, uuid, base64, list, set, map);
        }
    }
}
