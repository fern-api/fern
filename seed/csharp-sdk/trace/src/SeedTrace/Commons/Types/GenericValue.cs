using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(GenericValue.JsonConverter))]
[Serializable]
public record GenericValue
{
    [JsonPropertyName("stringifiedType")]
    public string? StringifiedType { get; set; }

    [JsonPropertyName("stringifiedValue")]
    public required string StringifiedValue { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<GenericValue>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(GenericValue).IsAssignableFrom(typeToConvert);

        public override GenericValue? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string? _stringifiedType = default;
            string _stringifiedValue = default;
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
                    case "stringifiedType":
                        _stringifiedType = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "stringifiedValue":
                        _stringifiedValue = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new GenericValue
            {
                StringifiedType = _stringifiedType,
                StringifiedValue = _stringifiedValue,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            GenericValue value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            if (value.StringifiedType != null)
            {
                writer.WritePropertyName("stringifiedType");
                JsonSerializer.Serialize(writer, value.StringifiedType, options);
            }
            writer.WritePropertyName("stringifiedValue");
            JsonSerializer.Serialize(writer, value.StringifiedValue, options);
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
    }
}
