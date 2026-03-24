using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedWebhooks.Core;

namespace SeedWebhooks;

[JsonConverter(typeof(PaymentNotificationPayload.JsonConverter))]
[Serializable]
public record PaymentNotificationPayload
{
    [JsonPropertyName("paymentId")]
    public required string PaymentId { get; set; }

    [JsonPropertyName("amount")]
    public required double Amount { get; set; }

    [JsonPropertyName("status")]
    public required string Status { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<PaymentNotificationPayload>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(PaymentNotificationPayload).IsAssignableFrom(typeToConvert);

        public override PaymentNotificationPayload? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _paymentId = default;
            double _amount = default;
            string _status = default;
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
                    case "paymentId":
                        _paymentId = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "amount":
                        _amount = JsonSerializer.Deserialize<double>(ref reader, options);
                        break;
                    case "status":
                        _status = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new PaymentNotificationPayload
            {
                PaymentId = _paymentId,
                Amount = _amount,
                Status = _status,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            PaymentNotificationPayload value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("paymentId");
            JsonSerializer.Serialize(writer, value.PaymentId, options);
            writer.WritePropertyName("amount");
            JsonSerializer.Serialize(writer, value.Amount, options);
            writer.WritePropertyName("status");
            JsonSerializer.Serialize(writer, value.Status, options);
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

        public override PaymentNotificationPayload ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<PaymentNotificationPayload>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            PaymentNotificationPayload value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
