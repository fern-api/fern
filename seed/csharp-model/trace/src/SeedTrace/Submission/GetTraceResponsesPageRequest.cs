using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(GetTraceResponsesPageRequest.JsonConverter))]
[Serializable]
public record GetTraceResponsesPageRequest
{
    [JsonPropertyName("offset")]
    public int? Offset { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<GetTraceResponsesPageRequest>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(GetTraceResponsesPageRequest).IsAssignableFrom(typeToConvert);

        public override GetTraceResponsesPageRequest? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            int? _offset = default;
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
                    case "offset":
                        _offset = JsonSerializer.Deserialize<int?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new GetTraceResponsesPageRequest
            {
                Offset = _offset,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            GetTraceResponsesPageRequest value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            if (value.Offset != null)
            {
                writer.WritePropertyName("offset");
                JsonSerializer.Serialize(writer, value.Offset, options);
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

        public override GetTraceResponsesPageRequest ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<GetTraceResponsesPageRequest>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            GetTraceResponsesPageRequest value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
