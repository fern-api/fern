using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedWebsocketMultiUrl.Core;

namespace SeedWebsocketMultiUrl;

[JsonConverter(typeof(SendEvent.JsonConverter))]
[Serializable]
public record SendEvent
{
    [JsonPropertyName("text")]
    public required string Text { get; set; }

    [JsonPropertyName("priority")]
    public required int Priority { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<SendEvent>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(SendEvent).IsAssignableFrom(typeToConvert);

        public override SendEvent? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _text = default;
            int _priority = default;
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
                    case "text":
                        _text = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "priority":
                        _priority = JsonSerializer.Deserialize<int>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new SendEvent
            {
                Text = _text,
                Priority = _priority,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            SendEvent value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("text");
            JsonSerializer.Serialize(writer, value.Text, options);
            writer.WritePropertyName("priority");
            JsonSerializer.Serialize(writer, value.Priority, options);
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
