using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedExtends.Core;

namespace SeedExtends;

[JsonConverter(typeof(Json.JsonConverter))]
[Serializable]
public record Json
{
    [JsonPropertyName("raw")]
    public required string Raw { get; set; }

    [JsonPropertyName("docs")]
    public required string Docs { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<Json>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(Json).IsAssignableFrom(typeToConvert);

        public override Json? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _raw = default;
            string _docs = default;
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
                    case "raw":
                        _raw = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "docs":
                        _docs = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new Json
            {
                Raw = _raw,
                Docs = _docs,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(Utf8JsonWriter writer, Json value, JsonSerializerOptions options)
        {
            writer.WriteStartObject();
            writer.WritePropertyName("raw");
            JsonSerializer.Serialize(writer, value.Raw, options);
            writer.WritePropertyName("docs");
            JsonSerializer.Serialize(writer, value.Docs, options);
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
