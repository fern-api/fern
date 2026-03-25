using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedServerSentEvents.Core;

namespace SeedServerSentEvents;

[JsonConverter(typeof(StreamedCompletion.JsonConverter))]
[Serializable]
public record StreamedCompletion
{
    [JsonPropertyName("delta")]
    public required string Delta { get; set; }

    [JsonPropertyName("tokens")]
    public int? Tokens { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<StreamedCompletion>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(StreamedCompletion).IsAssignableFrom(typeToConvert);

        public override StreamedCompletion? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _delta = default;
            int? _tokens = default;
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
                    case "delta":
                        _delta = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "tokens":
                        _tokens = JsonSerializer.Deserialize<int?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new StreamedCompletion
            {
                Delta = _delta,
                Tokens = _tokens,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            StreamedCompletion value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("delta");
            JsonSerializer.Serialize(writer, value.Delta, options);
            if (value.Tokens is not null)
            {
                writer.WritePropertyName("tokens");
                JsonSerializer.Serialize(writer, value.Tokens, options);
            }
            if (value.AdditionalProperties is not null)
            {
                foreach (var kvp in value.AdditionalProperties)
                {
                    writer.WritePropertyName(kvp.Key);
                    kvp.Value.WriteTo(writer);
                }
            }
            writer.WriteEndObject();
        }

        public override StreamedCompletion ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<StreamedCompletion>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            StreamedCompletion value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
