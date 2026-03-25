using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedNullableOptional.Core;

namespace SeedNullableOptional;

/// <summary>
/// Response for deserialization test
/// </summary>
[JsonConverter(typeof(DeserializationTestResponse.JsonConverter))]
[Serializable]
public record DeserializationTestResponse
{
    [JsonPropertyName("echo")]
    public required DeserializationTestRequest Echo { get; set; }

    [JsonPropertyName("processedAt")]
    public required DateTime ProcessedAt { get; set; }

    [JsonPropertyName("nullCount")]
    public required int NullCount { get; set; }

    [JsonPropertyName("presentFieldsCount")]
    public required int PresentFieldsCount { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<DeserializationTestResponse>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(DeserializationTestResponse).IsAssignableFrom(typeToConvert);

        public override DeserializationTestResponse? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            DeserializationTestRequest _echo = default;
            DateTime _processedAt = default;
            int _nullCount = default;
            int _presentFieldsCount = default;
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
                    case "echo":
                        _echo = JsonSerializer.Deserialize<DeserializationTestRequest>(
                            ref reader,
                            options
                        );
                        break;
                    case "processedAt":
                        _processedAt = JsonSerializer.Deserialize<DateTime>(ref reader, options);
                        break;
                    case "nullCount":
                        _nullCount = JsonSerializer.Deserialize<int>(ref reader, options);
                        break;
                    case "presentFieldsCount":
                        _presentFieldsCount = JsonSerializer.Deserialize<int>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new DeserializationTestResponse
            {
                Echo = _echo,
                ProcessedAt = _processedAt,
                NullCount = _nullCount,
                PresentFieldsCount = _presentFieldsCount,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            DeserializationTestResponse value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("echo");
            JsonSerializer.Serialize(writer, value.Echo, options);
            writer.WritePropertyName("processedAt");
            JsonSerializer.Serialize(writer, value.ProcessedAt, options);
            writer.WritePropertyName("nullCount");
            JsonSerializer.Serialize(writer, value.NullCount, options);
            writer.WritePropertyName("presentFieldsCount");
            JsonSerializer.Serialize(writer, value.PresentFieldsCount, options);
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

        public override DeserializationTestResponse ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<DeserializationTestResponse>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            DeserializationTestResponse value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
