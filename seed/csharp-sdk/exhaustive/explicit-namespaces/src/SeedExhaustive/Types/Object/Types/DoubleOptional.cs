using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedExhaustive;
using SeedExhaustive.Core;

namespace SeedExhaustive.Types.Object;

[JsonConverter(typeof(DoubleOptional.JsonConverter))]
[Serializable]
public record DoubleOptional
{
    [JsonPropertyName("optionalAlias")]
    public string? OptionalAlias { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<DoubleOptional>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(DoubleOptional).IsAssignableFrom(typeToConvert);

        public override DoubleOptional? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string? _optionalAlias = default;
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
                    case "optionalAlias":
                        _optionalAlias = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new DoubleOptional
            {
                OptionalAlias = _optionalAlias,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            DoubleOptional value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            if (value.OptionalAlias != null)
            {
                writer.WritePropertyName("optionalAlias");
                JsonSerializer.Serialize(writer, value.OptionalAlias, options);
            }
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
