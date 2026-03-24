using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedExhaustive;
using SeedExhaustive.Core;

namespace SeedExhaustive.Types.Object;

/// <summary>
/// Tests that unknown/any values containing backslashes in map keys
/// are properly escaped in Go string literals.
/// </summary>
[JsonConverter(typeof(ObjectWithUnknownField.JsonConverter))]
[Serializable]
public record ObjectWithUnknownField
{
    [JsonPropertyName("unknown")]
    public required object Unknown { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<ObjectWithUnknownField>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(ObjectWithUnknownField).IsAssignableFrom(typeToConvert);

        public override ObjectWithUnknownField? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            object _unknown = default;
            var extensionData = new Dictionary<string, JsonElement>();

            if (reader.TokenType != JsonTokenType.StartObject)
            {
                throw new JsonException("Expected StartObject");
            }

            while (reader.Read() && reader.TokenType != JsonTokenType.EndObject)
            {
                var propertyName = reader.GetString();
                reader.Read();

                switch (propertyName)
                {
                    case "unknown":
                        _unknown = JsonSerializer.Deserialize<object>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new ObjectWithUnknownField
            {
                Unknown = _unknown,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            ObjectWithUnknownField value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("unknown");
            JsonSerializer.Serialize(writer, value.Unknown, options);
            if (value.AdditionalProperties != null)
            {
                foreach (var kvp in value.AdditionalProperties)
                {
                    writer.WritePropertyName(kvp.Key);
                    kvp.Value.WriteTo(writer);
                }
            }
            writer.WriteEndObject();
        }

        public override ObjectWithUnknownField ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<ObjectWithUnknownField>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            ObjectWithUnknownField value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
