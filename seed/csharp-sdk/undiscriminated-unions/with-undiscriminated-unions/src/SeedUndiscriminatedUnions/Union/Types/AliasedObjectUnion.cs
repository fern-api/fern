// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedUndiscriminatedUnions.Core;

namespace SeedUndiscriminatedUnions;

/// <summary>
/// Undiscriminated union whose members are named aliases of object types
/// (including an alias-of-alias). Required keys are disjoint, so a correct
/// deserializer must emit containsKey() guards for each alias variant.
/// </summary>
[JsonConverter(typeof(AliasedObjectUnion.JsonConverter))]
[Serializable]
public class AliasedObjectUnion
{
    private AliasedObjectUnion(string type, object? value)
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
    /// Factory method to create a union from a LeafObjectA value.
    /// </summary>
    public static AliasedObjectUnion FromAliasedLeafA(LeafObjectA value) =>
        new("aliasedLeafA", value);

    /// <summary>
    /// Factory method to create a union from a LeafObjectB value.
    /// </summary>
    public static AliasedObjectUnion FromAliasedLeafB(LeafObjectB value) =>
        new("aliasedLeafB", value);

    /// <summary>
    /// Returns true if <see cref="Type"/> is "aliasedLeafA"
    /// </summary>
    public bool IsAliasedLeafA() => Type == "aliasedLeafA";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "aliasedLeafB"
    /// </summary>
    public bool IsAliasedLeafB() => Type == "aliasedLeafB";

    /// <summary>
    /// Returns the value as a <see cref="LeafObjectA"/> if <see cref="Type"/> is 'aliasedLeafA', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedUndiscriminatedUnionsException">Thrown when <see cref="Type"/> is not 'aliasedLeafA'.</exception>
    public LeafObjectA AsAliasedLeafA() =>
        IsAliasedLeafA()
            ? (LeafObjectA)Value!
            : throw new SeedUndiscriminatedUnionsException("Union type is not 'aliasedLeafA'");

    /// <summary>
    /// Returns the value as a <see cref="LeafObjectB"/> if <see cref="Type"/> is 'aliasedLeafB', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedUndiscriminatedUnionsException">Thrown when <see cref="Type"/> is not 'aliasedLeafB'.</exception>
    public LeafObjectB AsAliasedLeafB() =>
        IsAliasedLeafB()
            ? (LeafObjectB)Value!
            : throw new SeedUndiscriminatedUnionsException("Union type is not 'aliasedLeafB'");

    /// <summary>
    /// Attempts to cast the value to a <see cref="LeafObjectA"/> and returns true if successful.
    /// </summary>
    public bool TryGetAliasedLeafA(out LeafObjectA? value)
    {
        if (Type == "aliasedLeafA")
        {
            value = (LeafObjectA)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="LeafObjectB"/> and returns true if successful.
    /// </summary>
    public bool TryGetAliasedLeafB(out LeafObjectB? value)
    {
        if (Type == "aliasedLeafB")
        {
            value = (LeafObjectB)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public T Match<T>(Func<LeafObjectA, T> onAliasedLeafA, Func<LeafObjectB, T> onAliasedLeafB)
    {
        return Type switch
        {
            "aliasedLeafA" => onAliasedLeafA(AsAliasedLeafA()),
            "aliasedLeafB" => onAliasedLeafB(AsAliasedLeafB()),
            _ => throw new SeedUndiscriminatedUnionsException($"Unknown union type: {Type}"),
        };
    }

    public void Visit(Action<LeafObjectA> onAliasedLeafA, Action<LeafObjectB> onAliasedLeafB)
    {
        switch (Type)
        {
            case "aliasedLeafA":
                onAliasedLeafA(AsAliasedLeafA());
                break;
            case "aliasedLeafB":
                onAliasedLeafB(AsAliasedLeafB());
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
        if (obj is not AliasedObjectUnion other)
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

    public static implicit operator AliasedObjectUnion(LeafObjectA value) =>
        new("aliasedLeafA", value);

    public static implicit operator AliasedObjectUnion(LeafObjectB value) =>
        new("aliasedLeafB", value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<AliasedObjectUnion>
    {
        public override AliasedObjectUnion? Read(
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
                    ("aliasedLeafA", typeof(LeafObjectA)),
                    ("aliasedLeafB", typeof(LeafObjectB)),
                };

                foreach (var (key, type) in types)
                {
                    try
                    {
                        var value = document.Deserialize(type, options);
                        if (value != null)
                        {
                            AliasedObjectUnion result = new(key, value);
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
                $"Cannot deserialize JSON token {reader.TokenType} into AliasedObjectUnion"
            );
        }

        public override void Write(
            Utf8JsonWriter writer,
            AliasedObjectUnion value,
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

        public override AliasedObjectUnion ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue = reader.GetString()!;
            AliasedObjectUnion result = new("string", stringValue);
            return result;
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            AliasedObjectUnion value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Value?.ToString() ?? "null");
        }
    }
}
