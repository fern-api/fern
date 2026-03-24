using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(TraceResponsesPage.JsonConverter))]
[Serializable]
public record TraceResponsesPage
{
    /// <summary>
    /// If present, use this to load subsequent pages.
    /// The offset is the id of the next trace response to load.
    /// </summary>
    [JsonPropertyName("offset")]
    public int? Offset { get; set; }

    [JsonPropertyName("traceResponses")]
    public IEnumerable<TraceResponse> TraceResponses { get; set; } = new List<TraceResponse>();

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<TraceResponsesPage>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(TraceResponsesPage).IsAssignableFrom(typeToConvert);

        public override TraceResponsesPage? Read(
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
            IEnumerable<TraceResponse> _traceResponses = default;
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
                        _traceResponses = JsonSerializer.Deserialize<IEnumerable<TraceResponse>>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new TraceResponsesPage
            {
                Offset = _offset,
                TraceResponses = _traceResponses,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            TraceResponsesPage value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            if (value.Offset != null)
            {
                writer.WritePropertyName("offset");
                JsonSerializer.Serialize(writer, value.Offset, options);
            }
            writer.WritePropertyName("traceResponses");
            JsonSerializer.Serialize(writer, value.TraceResponses, options);
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
    }
}
