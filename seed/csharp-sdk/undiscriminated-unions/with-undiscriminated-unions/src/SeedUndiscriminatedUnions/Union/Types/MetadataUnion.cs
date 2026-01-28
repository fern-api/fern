// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Serialization;
using SeedUndiscriminatedUnions.Core;

namespace SeedUndiscriminatedUnions;

[JsonConverter(typeof(MetadataUnion.JsonConverter))]
[Serializable]
public class MetadataUnion
{
    private MetadataUnion(string type, object? value)
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
    /// Factory method to create a union from a Dictionary<string, object?>? value.
    /// </summary>
    public static MetadataUnion FromOptionalMetadata(Dictionary<string, object?>? value) =>
        new("optionalMetadata", value);

    /// <summary>
    /// Factory method to create a union from a SeedUndiscriminatedUnions.NamedMetadata value.
    /// </summary>
    public static MetadataUnion FromNamedMetadata(SeedUndiscriminatedUnions.NamedMetadata value) =>
        new("namedMetadata", value);

    /// <summary>
    /// Returns true if <see cref="Type"/> is "optionalMetadata"
    /// </summary>
    public bool IsOptionalMetadata() => Type == "optionalMetadata";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "namedMetadata"
    /// </summary>
    public bool IsNamedMetadata() => Type == "namedMetadata";

    /// <summary>
    /// Returns the value as a <see cref="Dictionary<string, object?>?"/> if <see cref="Type"/> is 'optionalMetadata', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedUndiscriminatedUnionsException">Thrown when <see cref="Type"/> is not 'optionalMetadata'.</exception>
    public Dictionary<string, object?>? AsOptionalMetadata() =>
        IsOptionalMetadata()
            ? (Dictionary<string, object?>?)Value!
            : throw new SeedUndiscriminatedUnionsException("Union type is not 'optionalMetadata'");

    /// <summary>
    /// Returns the value as a <see cref="SeedUndiscriminatedUnions.NamedMetadata"/> if <see cref="Type"/> is 'namedMetadata', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedUndiscriminatedUnionsException">Thrown when <see cref="Type"/> is not 'namedMetadata'.</exception>
    public SeedUndiscriminatedUnions.NamedMetadata AsNamedMetadata() =>
        IsNamedMetadata()
            ? (SeedUndiscriminatedUnions.NamedMetadata)Value!
            : throw new SeedUndiscriminatedUnionsException("Union type is not 'namedMetadata'");

    /// <summary>
    /// Attempts to cast the value to a <see cref="Dictionary<string, object?>?"/> and returns true if successful.
    /// </summary>
    public bool TryGetOptionalMetadata(out Dictionary<string, object?>? value)
    {
        if (Type == "optionalMetadata")
        {
            value = (Dictionary<string, object?>?)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedUndiscriminatedUnions.NamedMetadata"/> and returns true if successful.
    /// </summary>
    public bool TryGetNamedMetadata(out SeedUndiscriminatedUnions.NamedMetadata? value)
    {
        if (Type == "namedMetadata")
        {
            value = (SeedUndiscriminatedUnions.NamedMetadata)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public T Match<T>(
        Func<Dictionary<string, object?>?, T> onOptionalMetadata,
        Func<SeedUndiscriminatedUnions.NamedMetadata, T> onNamedMetadata
    )
    {
        return Type switch
        {
            "optionalMetadata" => onOptionalMetadata(AsOptionalMetadata()),
            "namedMetadata" => onNamedMetadata(AsNamedMetadata()),
            _ => throw new SeedUndiscriminatedUnionsException($"Unknown union type: {Type}"),
        };
    }

    public void Visit(
        Action<Dictionary<string, object?>?> onOptionalMetadata,
        Action<SeedUndiscriminatedUnions.NamedMetadata> onNamedMetadata
    )
    {
        switch (Type)
        {
            case "optionalMetadata":
                onOptionalMetadata(AsOptionalMetadata());
                break;
            case "namedMetadata":
                onNamedMetadata(AsNamedMetadata());
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
        if (obj is not MetadataUnion other)
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

    public static implicit operator MetadataUnion(Dictionary<string, object?>? value) =>
        new("optionalMetadata", value);

    public static implicit operator MetadataUnion(SeedUndiscriminatedUnions.NamedMetadata value) =>
        new("namedMetadata", value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<MetadataUnion>
    {
        public override MetadataUnion? Read(
            ref Utf8JsonReader reader,
            System.Type typeToConvert,
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
                    ("namedMetadata", typeof(SeedUndiscriminatedUnions.NamedMetadata)),
                    ("optionalMetadata", typeof(Dictionary<string, object?>)),
                };

                foreach (var (key, type) in types)
                {
                    try
                    {
                        var value = document.Deserialize(type, options);
                        if (value != null)
                        {
                            MetadataUnion result = new(key, value);
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
                $"Cannot deserialize JSON token {reader.TokenType} into MetadataUnion"
            );
        }

        public override void Write(
            Utf8JsonWriter writer,
            MetadataUnion value,
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

        public override MetadataUnion? ReadAsPropertyName(
            ref Utf8JsonReader reader,
            System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue = reader.GetString()!;
            MetadataUnion result = new("string", stringValue);
            return result;
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            MetadataUnion value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Value?.ToString() ?? "null");
        }
    }
}
