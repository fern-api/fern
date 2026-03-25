using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedWebhooks.Core;

namespace SeedWebhooks;

[JsonConverter(typeof(RefundProcessedPayload.JsonConverter))]
[Serializable]
public record RefundProcessedPayload
{
    [JsonPropertyName("refundId")]
    public required string RefundId { get; set; }

    [JsonPropertyName("amount")]
    public required double Amount { get; set; }

    [JsonPropertyName("reason")]
    public string? Reason { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<RefundProcessedPayload>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(RefundProcessedPayload).IsAssignableFrom(typeToConvert);

        public override RefundProcessedPayload? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _refundId = default;
            double _amount = default;
            string? _reason = default;
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
                    case "refundId":
                        _refundId = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "amount":
                        _amount = JsonSerializer.Deserialize<double>(ref reader, options);
                        break;
                    case "reason":
                        _reason = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new RefundProcessedPayload
            {
                RefundId = _refundId,
                Amount = _amount,
                Reason = _reason,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            RefundProcessedPayload value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("refundId");
            JsonSerializer.Serialize(writer, value.RefundId, options);
            writer.WritePropertyName("amount");
            JsonSerializer.Serialize(writer, value.Amount, options);
            if (value.Reason is not null)
            {
                writer.WritePropertyName("reason");
                JsonSerializer.Serialize(writer, value.Reason, options);
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

        public override RefundProcessedPayload ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<RefundProcessedPayload>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            RefundProcessedPayload value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
