using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedExamples;
using SeedExamples.Core;

namespace SeedExamples.Commons;

[JsonConverter(typeof(Metadata.JsonConverter))]
[Serializable]
public record Metadata
{
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("data")]
    public Dictionary<string, string>? Data { get; set; }

    [JsonPropertyName("jsonString")]
    public string? JsonString { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<Metadata>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(Metadata).IsAssignableFrom(typeToConvert);

        public override Metadata? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _id = default;
            Dictionary<string, string>? _data = default;
            string? _jsonString = default;
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
                    case "id":
                        _id = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "data":
                        _data = JsonSerializer.Deserialize<Dictionary<string, string>?>(
                            ref reader,
                            options
                        );
                        break;
                    case "jsonString":
                        _jsonString = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new Metadata
            {
                Id = _id,
                Data = _data,
                JsonString = _jsonString,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            Metadata value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("id");
            JsonSerializer.Serialize(writer, value.Id, options);
            if (value.Data != null)
            {
                writer.WritePropertyName("data");
                JsonSerializer.Serialize(writer, value.Data, options);
            }
            if (value.JsonString != null)
            {
                writer.WritePropertyName("jsonString");
                JsonSerializer.Serialize(writer, value.JsonString, options);
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

        public override Metadata ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<Metadata>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            Metadata value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
