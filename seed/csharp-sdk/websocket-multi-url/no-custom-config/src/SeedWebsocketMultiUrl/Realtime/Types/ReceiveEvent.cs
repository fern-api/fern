using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedWebsocketMultiUrl.Core;

namespace SeedWebsocketMultiUrl;

[JsonConverter(typeof(ReceiveEvent.JsonConverter))]
[Serializable]
public record ReceiveEvent
{
    [JsonPropertyName("data")]
    public required string Data { get; set; }

    [JsonPropertyName("timestamp")]
    public required int Timestamp { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<ReceiveEvent>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(ReceiveEvent).IsAssignableFrom(typeToConvert);

        public override ReceiveEvent? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _data = default;
            int _timestamp = default;
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
                        _data = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "timestamp":
                        _timestamp = JsonSerializer.Deserialize<int>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new ReceiveEvent
            {
                Data = _data,
                Timestamp = _timestamp,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            ReceiveEvent value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("data");
            JsonSerializer.Serialize(writer, value.Data, options);
            writer.WritePropertyName("timestamp");
            JsonSerializer.Serialize(writer, value.Timestamp, options);
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

        public override ReceiveEvent ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<ReceiveEvent>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            ReceiveEvent value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
