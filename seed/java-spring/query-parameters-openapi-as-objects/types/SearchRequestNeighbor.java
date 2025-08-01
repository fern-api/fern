/**
 * This file was auto-generated by Fern from our API Definition.
 */

package types;

import com.fasterxml.jackson.annotation.JsonValue;
import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;
import core.ObjectMappers;
import java.io.IOException;
import java.lang.IllegalArgumentException;
import java.lang.IllegalStateException;
import java.lang.Integer;
import java.lang.Object;
import java.lang.String;
import java.lang.SuppressWarnings;
import java.util.Objects;

@JsonDeserialize(
    using = SearchRequestNeighbor.Deserializer.class
)
public final class SearchRequestNeighbor {
  private final Object value;

  private final int type;

  private SearchRequestNeighbor(Object value, int type) {
    this.value = value;
    this.type = type;
  }

  @JsonValue
  public Object get() {
    return this.value;
  }

  @SuppressWarnings("unchecked")
  public <T> T visit(Visitor<T> visitor) {
    if(this.type == 0) {
      return visitor.visit((User) this.value);
    } else if(this.type == 1) {
      return visitor.visit((NestedUser) this.value);
    } else if(this.type == 2) {
      return visitor.visit((String) this.value);
    } else if(this.type == 3) {
      return visitor.visit((int) this.value);
    }
    throw new IllegalStateException("Failed to visit value. This should never happen.");
  }

  @java.lang.Override
  public boolean equals(Object other) {
    if (this == other) return true;
    return other instanceof SearchRequestNeighbor && equalTo((SearchRequestNeighbor) other);
  }

  private boolean equalTo(SearchRequestNeighbor other) {
    return value.equals(other.value);
  }

  @java.lang.Override
  public int hashCode() {
    return Objects.hash(this.value);
  }

  @java.lang.Override
  public String toString() {
    return this.value.toString();
  }

  public static SearchRequestNeighbor of(User value) {
    return new SearchRequestNeighbor(value, 0);
  }

  public static SearchRequestNeighbor of(NestedUser value) {
    return new SearchRequestNeighbor(value, 1);
  }

  public static SearchRequestNeighbor of(String value) {
    return new SearchRequestNeighbor(value, 2);
  }

  public static SearchRequestNeighbor of(int value) {
    return new SearchRequestNeighbor(value, 3);
  }

  public interface Visitor<T> {
    T visit(User value);

    T visit(NestedUser value);

    T visit(String value);

    T visit(int value);
  }

  static final class Deserializer extends StdDeserializer<SearchRequestNeighbor> {
    Deserializer() {
      super(SearchRequestNeighbor.class);
    }

    @java.lang.Override
    public SearchRequestNeighbor deserialize(JsonParser p, DeserializationContext context) throws
        IOException {
      Object value = p.readValueAs(Object.class);
      try {
        return of(ObjectMappers.JSON_MAPPER.convertValue(value, User.class));
      } catch(IllegalArgumentException e) {
      }
      try {
        return of(ObjectMappers.JSON_MAPPER.convertValue(value, NestedUser.class));
      } catch(IllegalArgumentException e) {
      }
      try {
        return of(ObjectMappers.JSON_MAPPER.convertValue(value, String.class));
      } catch(IllegalArgumentException e) {
      }
      if (value instanceof Integer) {
        return of((Integer) value);
      }
      throw new JsonParseException(p, "Failed to deserialize");
    }
  }
}
