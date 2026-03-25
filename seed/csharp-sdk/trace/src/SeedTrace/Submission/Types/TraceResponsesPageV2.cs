using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(TraceResponsesPageV2.JsonConverter))]
[Serializable]
public record TraceResponsesPageV2
{
    /// <summary>
    /// If present, use this to load subsequent pages.
    /// The offset is the id of the next trace response to load.
    /// </summary>
    [JsonPropertyName("offset")]
    public int? Offset { get; set; }

    [JsonPropertyName("traceResponses")]
    public IEnumerable<TraceResponseV2> TraceResponses { get; set; } = new List<TraceResponseV2>();

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<TraceResponsesPageV2>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(TraceResponsesPageV2).IsAssignableFrom(typeToConvert);

        public override TraceResponsesPageV2? Read(
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
            IEnumerable<TraceResponseV2> _traceResponses = default;
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
                    case "traceResponses":
                        _traceResponses = JsonSerializer.Deserialize<IEnumerable<TraceResponseV2>>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new TraceResponsesPageV2
            {
                Offset = _offset,
                TraceResponses = _traceResponses,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            TraceResponsesPageV2 value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            if (value.Offset is not null)
            {
                writer.WritePropertyName("offset");
                JsonSerializer.Serialize(writer, value.Offset, options);
            }
            writer.WritePropertyName("traceResponses");
            JsonSerializer.Serialize(writer, value.TraceResponses, options);
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

        public override TraceResponsesPageV2 ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<TraceResponsesPageV2>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            TraceResponsesPageV2 value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
