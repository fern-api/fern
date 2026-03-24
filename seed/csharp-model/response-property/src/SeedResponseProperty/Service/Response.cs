using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedResponseProperty.Core;

namespace SeedResponseProperty;

[JsonConverter(typeof(Response.JsonConverter))]
[Serializable]
public record Response
{
    [JsonPropertyName("data")]
    public required Movie Data { get; set; }

    [JsonPropertyName("metadata")]
    public Dictionary<string, string> Metadata { get; set; } = new Dictionary<string, string>();

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
    internal sealed class JsonConverter : JsonConverter<Response>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(Response).IsAssignableFrom(typeToConvert);

        public override Response? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            Movie _data = default;
            Dictionary<string, string> _metadata = default;
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
                    case "data":
                        _data = JsonSerializer.Deserialize<Movie>(ref reader, options);
                        break;
                    case "metadata":
                        _metadata = JsonSerializer.Deserialize<Dictionary<string, string>>(
                            ref reader,
                            options
                        );
                        break;
                    case "docs":
                        _docs = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new Response
            {
                Data = _data,
                Metadata = _metadata,
                Docs = _docs,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            Response value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("data");
            JsonSerializer.Serialize(writer, value.Data, options);
            writer.WritePropertyName("metadata");
            JsonSerializer.Serialize(writer, value.Metadata, options);
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
