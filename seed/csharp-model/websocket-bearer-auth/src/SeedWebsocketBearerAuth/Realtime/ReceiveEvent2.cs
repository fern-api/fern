using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedWebsocketBearerAuth.Core;

namespace SeedWebsocketBearerAuth;

[JsonConverter(typeof(ReceiveEvent2.JsonConverter))]
[Serializable]
public record ReceiveEvent2
{
    [JsonPropertyName("gamma")]
    public required string Gamma { get; set; }

    [JsonPropertyName("delta")]
    public required int Delta { get; set; }

    [JsonPropertyName("epsilon")]
    public required bool Epsilon { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<ReceiveEvent2>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(ReceiveEvent2).IsAssignableFrom(typeToConvert);

        public override ReceiveEvent2? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _gamma = default;
            int _delta = default;
            bool _epsilon = default;
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
                    case "gamma":
                        _gamma = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "delta":
                        _delta = JsonSerializer.Deserialize<int>(ref reader, options);
                        break;
                    case "epsilon":
                        _epsilon = JsonSerializer.Deserialize<bool>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new ReceiveEvent2
            {
                Gamma = _gamma,
                Delta = _delta,
                Epsilon = _epsilon,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            ReceiveEvent2 value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("gamma");
            JsonSerializer.Serialize(writer, value.Gamma, options);
            writer.WritePropertyName("delta");
            JsonSerializer.Serialize(writer, value.Delta, options);
            writer.WritePropertyName("epsilon");
            JsonSerializer.Serialize(writer, value.Epsilon, options);
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

        public override ReceiveEvent2 ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<ReceiveEvent2>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            ReceiveEvent2 value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
