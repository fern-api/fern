// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedUndiscriminatedUnions.Core;

namespace SeedUndiscriminatedUnions;

/// <summary>
/// Inner union with two object variants that have disjoint required keys.
/// Tests that required-key guards work correctly inside nested union contexts.
/// </summary>
[JsonConverter(typeof(NestedObjectUnion.JsonConverter))]
[Serializable]
public class NestedObjectUnion
{
    private NestedObjectUnion(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Type discriminator
    /// </summary>
    [JsonIgnore]
    public string Type { get; internal set; }

    /// <summary>
    /// Union value
    /// </summary>
    [JsonIgnore]
    public object? Value { get; internal set; }

    /// <summary>
    /// Factory method to create a union from a SeedUndiscriminatedUnions.LeafTypeA value.
    /// </summary>
    public static NestedObjectUnion FromLeafTypeA(SeedUndiscriminatedUnions.LeafTypeA value) =>
        new("leafTypeA", value);

    /// <summary>
    /// Factory method to create a union from a SeedUndiscriminatedUnions.LeafTypeB value.
    /// </summary>
    public static NestedObjectUnion FromLeafTypeB(SeedUndiscriminatedUnions.LeafTypeB value) =>
        new("leafTypeB", value);

    /// <summary>
    /// Returns true if <see cref="Type"/> is "leafTypeA"
    /// </summary>
    public bool IsLeafTypeA() => Type == "leafTypeA";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "leafTypeB"
    /// </summary>
    public bool IsLeafTypeB() => Type == "leafTypeB";

    /// <summary>
    /// Returns the value as a <see cref="SeedUndiscriminatedUnions.LeafTypeA"/> if <see cref="Type"/> is 'leafTypeA', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedUndiscriminatedUnionsException">Thrown when <see cref="Type"/> is not 'leafTypeA'.</exception>
    public SeedUndiscriminatedUnions.LeafTypeA AsLeafTypeA() =>
        IsLeafTypeA()
            ? (SeedUndiscriminatedUnions.LeafTypeA)Value!
            : throw new SeedUndiscriminatedUnionsException("Union type is not 'leafTypeA'");

    /// <summary>
    /// Returns the value as a <see cref="SeedUndiscriminatedUnions.LeafTypeB"/> if <see cref="Type"/> is 'leafTypeB', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedUndiscriminatedUnionsException">Thrown when <see cref="Type"/> is not 'leafTypeB'.</exception>
    public SeedUndiscriminatedUnions.LeafTypeB AsLeafTypeB() =>
        IsLeafTypeB()
            ? (SeedUndiscriminatedUnions.LeafTypeB)Value!
            : throw new SeedUndiscriminatedUnionsException("Union type is not 'leafTypeB'");

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedUndiscriminatedUnions.LeafTypeA"/> and returns true if successful.
    /// </summary>
    public bool TryGetLeafTypeA(out SeedUndiscriminatedUnions.LeafTypeA? value)
    {
        if (Type == "leafTypeA")
        {
            value = (SeedUndiscriminatedUnions.LeafTypeA)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedUndiscriminatedUnions.LeafTypeB"/> and returns true if successful.
    /// </summary>
    public bool TryGetLeafTypeB(out SeedUndiscriminatedUnions.LeafTypeB? value)
    {
        if (Type == "leafTypeB")
        {
            value = (SeedUndiscriminatedUnions.LeafTypeB)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public T Match<T>(
        Func<SeedUndiscriminatedUnions.LeafTypeA, T> onLeafTypeA,
        Func<SeedUndiscriminatedUnions.LeafTypeB, T> onLeafTypeB
    )
    {
        return Type switch
        {
            "leafTypeA" => onLeafTypeA(AsLeafTypeA()),
            "leafTypeB" => onLeafTypeB(AsLeafTypeB()),
            _ => throw new SeedUndiscriminatedUnionsException($"Unknown union type: {Type}"),
        };
    }

    public void Visit(
        Action<SeedUndiscriminatedUnions.LeafTypeA> onLeafTypeA,
        Action<SeedUndiscriminatedUnions.LeafTypeB> onLeafTypeB
    )
    {
        switch (Type)
        {
            case "leafTypeA":
                onLeafTypeA(AsLeafTypeA());
                break;
            case "leafTypeB":
                onLeafTypeB(AsLeafTypeB());
                break;
            default:
                throw new SeedUndiscriminatedUnionsException($"Unknown union type: {Type}");
        }
    }

    public override int GetHashCode()
    {
        unchecked
        {
            var hashCode = Type.GetHashCode();
            if (Value != null)
            {
                hashCode = (hashCode * 397) ^ Value.GetHashCode();
            }
            return hashCode;
        }
    }

    public override bool Equals(object? obj)
    {
        if (obj is null)
            return false;
        if (ReferenceEquals(this, obj))
            return true;
        if (obj is not NestedObjectUnion other)
            return false;

        // Compare type discriminators
        if (Type != other.Type)
            return false;

        // Compare values using EqualityComparer for deep comparison
        return System.Collections.Generic.EqualityComparer<object?>.Default.Equals(
            Value,
            other.Value
        );
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator NestedObjectUnion(SeedUndiscriminatedUnions.LeafTypeA value) =>
        new("leafTypeA", value);

    public static implicit operator NestedObjectUnion(SeedUndiscriminatedUnions.LeafTypeB value) =>
        new("leafTypeB", value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<NestedObjectUnion>
    {
        public override NestedObjectUnion? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            if (reader.TokenType == JsonTokenType.StartObject)
            {
                var document = JsonDocument.ParseValue(ref reader);

                var types = new (string Key, System.Type Type)[]
                {
                    ("leafTypeA", typeof(SeedUndiscriminatedUnions.LeafTypeA)),
                    ("leafTypeB", typeof(SeedUndiscriminatedUnions.LeafTypeB)),
                };

                foreach (var (key, type) in types)
                {
                    try
                    {
                        var value = document.Deserialize(type, options);
                        if (value != null)
                        {
                            NestedObjectUnion result = new(key, value);
                            return result;
                        }
                    }
                    catch (JsonException)
                    {
                        // Try next type;
                    }
                }
            }

            throw new JsonException(
                $"Cannot deserialize JSON token {reader.TokenType} into NestedObjectUnion"
            );
        }

        public override void Write(
            Utf8JsonWriter writer,
            NestedObjectUnion value,
            JsonSerializerOptions options
        )
        {
            if (value == null)
            {
                writer.WriteNullValue();
                return;
            }

            value.Visit(
                obj => JsonSerializer.Serialize(writer, obj, options),
                obj => JsonSerializer.Serialize(writer, obj, options)
            );
        }

        public override NestedObjectUnion ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue = reader.GetString()!;
            NestedObjectUnion result = new("string", stringValue);
            return result;
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            NestedObjectUnion value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Value?.ToString() ?? "null");
        }
    }
}
