using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedUndiscriminatedUnions.Core;

namespace SeedUndiscriminatedUnions;

[JsonConverter(typeof(TokenizeCard.JsonConverter))]
[Serializable]
public record TokenizeCard
{
    [JsonPropertyName("method")]
    public required string Method { get; set; }

    [JsonPropertyName("cardNumber")]
    public required string CardNumber { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<TokenizeCard>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(TokenizeCard).IsAssignableFrom(typeToConvert);

        public override TokenizeCard? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _method = default;
            string _cardNumber = default;
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
                    case "method":
                        _method = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "cardNumber":
                        _cardNumber = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new TokenizeCard
            {
                Method = _method,
                CardNumber = _cardNumber,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            TokenizeCard value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("method");
            JsonSerializer.Serialize(writer, value.Method, options);
            writer.WritePropertyName("cardNumber");
            JsonSerializer.Serialize(writer, value.CardNumber, options);
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

        public override TokenizeCard ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<TokenizeCard>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            TokenizeCard value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
