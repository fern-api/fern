using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedDollarStringExamples.Core;

namespace SeedDollarStringExamples;

[JsonConverter(typeof(PaymentInfo.JsonConverter))]
[Serializable]
public record PaymentInfo
{
    [JsonPropertyName("amount")]
    public required string Amount { get; set; }

    [JsonPropertyName("currency")]
    public required string Currency { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<PaymentInfo>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(PaymentInfo).IsAssignableFrom(typeToConvert);

        public override PaymentInfo? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _amount = default;
            string _currency = default;
            string? _description = default;
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
                    case "amount":
                        _amount = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "currency":
                        _currency = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "description":
                        _description = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new PaymentInfo
            {
                Amount = _amount,
                Currency = _currency,
                Description = _description,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            PaymentInfo value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("amount");
            JsonSerializer.Serialize(writer, value.Amount, options);
            writer.WritePropertyName("currency");
            JsonSerializer.Serialize(writer, value.Currency, options);
            if (value.Description is not null)
            {
                writer.WritePropertyName("description");
                JsonSerializer.Serialize(writer, value.Description, options);
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

        public override PaymentInfo ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<PaymentInfo>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            PaymentInfo value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
