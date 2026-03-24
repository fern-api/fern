using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedPagination.Core;

namespace SeedPagination;

[JsonConverter(typeof(SingleFilterSearchRequest.JsonConverter))]
[Serializable]
public record SingleFilterSearchRequest
{
    [JsonPropertyName("field")]
    public string? Field { get; set; }

    [JsonPropertyName("operator")]
    public SingleFilterSearchRequestOperator? Operator { get; set; }

    [JsonPropertyName("value")]
    public string? Value { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<SingleFilterSearchRequest>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(SingleFilterSearchRequest).IsAssignableFrom(typeToConvert);

        public override SingleFilterSearchRequest? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string? _field = default;
            SingleFilterSearchRequestOperator? _operator = default;
            string? _value = default;
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
                    case "field":
                        _field = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "operator":
                        _operator = JsonSerializer.Deserialize<SingleFilterSearchRequestOperator?>(
                            ref reader,
                            options
                        );
                        break;
                    case "value":
                        _value = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new SingleFilterSearchRequest
            {
                Field = _field,
                Operator = _operator,
                Value = _value,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            SingleFilterSearchRequest value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            if (value.Field != null)
            {
                writer.WritePropertyName("field");
                JsonSerializer.Serialize(writer, value.Field, options);
            }
            if (value.Operator != null)
            {
                writer.WritePropertyName("operator");
                JsonSerializer.Serialize(writer, value.Operator, options);
            }
            if (value.Value != null)
            {
                writer.WritePropertyName("value");
                JsonSerializer.Serialize(writer, value.Value, options);
            }
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

        public override SingleFilterSearchRequest ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<SingleFilterSearchRequest>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            SingleFilterSearchRequest value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
