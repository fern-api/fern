package com.seed.fileUpload.resources.service.types;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import java.util.Objects;

@JsonInclude(JsonInclude.Include.NON_EMPTY)
@JsonDeserialize(builder = MyObject.Builder.class)
public final class MyObject {
    private final String foo;

    private MyObject(String foo) {
        this.foo = foo;
    }

    @JsonProperty("foo")
    public String getFoo() {
        return foo;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) return true;
        return other instanceof MyObject && equalTo((MyObject) other);
    }

    private boolean equalTo(MyObject other) {
        return foo.equals(other.foo);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.foo);
    }

    @Override
    public String toString() {
        return "MyObject{" + "foo: " + foo + "}";
    }

    public static FooStage builder() {
        return new Builder();
    }

    public interface FooStage {
        _FinalStage foo(String foo);

        Builder from(MyObject other);
    }

    public interface _FinalStage {
        MyObject build();
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static final class Builder implements FooStage, _FinalStage {
        private String foo;

        private Builder() {}

        @Override
        public Builder from(MyObject other) {
            foo(other.getFoo());
            return this;
        }

        @Override
        @JsonSetter("foo")
        public _FinalStage foo(String foo) {
            this.foo = foo;
            return this;
        }

        @Override
        public MyObject build() {
            return new MyObject(foo);
        }
    }
}
