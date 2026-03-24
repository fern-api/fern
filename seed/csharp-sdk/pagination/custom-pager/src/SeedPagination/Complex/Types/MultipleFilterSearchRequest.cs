using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using OneOf;
using SeedPagination.Core;

namespace SeedPagination;

[JsonConverter(typeof(MultipleFilterSearchRequest.JsonConverter))]
[Serializable]
public record MultipleFilterSearchRequest
{
    [JsonPropertyName("operator")]
    public MultipleFilterSearchRequestOperator? Operator { get; set; }

    [JsonPropertyName("value")]
    public OneOf<
        IEnumerable<MultipleFilterSearchRequest>,
        IEnumerable<SingleFilterSearchRequest>
    >? Value { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<MultipleFilterSearchRequest>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(MultipleFilterSearchRequest).IsAssignableFrom(typeToConvert);

        public override MultipleFilterSearchRequest? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            MultipleFilterSearchRequestOperator? _operator = default;
            OneOf<
                IEnumerable<MultipleFilterSearchRequest>,
                IEnumerable<SingleFilterSearchRequest>
            >? _value = default;
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
                    case "operator":
                        _operator =
                            JsonSerializer.Deserialize<MultipleFilterSearchRequestOperator?>(
                                ref reader,
                                options
                            );
                        break;
                    case "value":
                        _value = JsonSerializer.Deserialize<OneOf<
                            IEnumerable<MultipleFilterSearchRequest>,
                            IEnumerable<SingleFilterSearchRequest>
                        >?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new MultipleFilterSearchRequest
            {
                Operator = _operator,
                Value = _value,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            MultipleFilterSearchRequest value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
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

        public override MultipleFilterSearchRequest ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<MultipleFilterSearchRequest>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            MultipleFilterSearchRequest value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
