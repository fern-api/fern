using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedWebhooks.Core;

namespace SeedWebhooks;

[JsonConverter(typeof(OrderCompletedPayload.JsonConverter))]
[Serializable]
public record OrderCompletedPayload
{
    [JsonPropertyName("orderId")]
    public required string OrderId { get; set; }

    [JsonPropertyName("total")]
    public required double Total { get; set; }

    [JsonPropertyName("currency")]
    public required string Currency { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<OrderCompletedPayload>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(OrderCompletedPayload).IsAssignableFrom(typeToConvert);

        public override OrderCompletedPayload? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _orderId = default;
            double _total = default;
            string _currency = default;
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
                    case "orderId":
                        _orderId = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "total":
                        _total = JsonSerializer.Deserialize<double>(ref reader, options);
                        break;
                    case "currency":
                        _currency = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new OrderCompletedPayload
            {
                OrderId = _orderId,
                Total = _total,
                Currency = _currency,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            OrderCompletedPayload value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("orderId");
            JsonSerializer.Serialize(writer, value.OrderId, options);
            writer.WritePropertyName("total");
            JsonSerializer.Serialize(writer, value.Total, options);
            writer.WritePropertyName("currency");
            JsonSerializer.Serialize(writer, value.Currency, options);
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

        public override OrderCompletedPayload ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<OrderCompletedPayload>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            OrderCompletedPayload value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
