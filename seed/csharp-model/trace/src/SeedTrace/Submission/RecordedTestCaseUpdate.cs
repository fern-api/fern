using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(RecordedTestCaseUpdate.JsonConverter))]
[Serializable]
public record RecordedTestCaseUpdate
{
    [JsonPropertyName("testCaseId")]
    public required string TestCaseId { get; set; }

    [JsonPropertyName("traceResponsesSize")]
    public required int TraceResponsesSize { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<RecordedTestCaseUpdate>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(RecordedTestCaseUpdate).IsAssignableFrom(typeToConvert);

        public override RecordedTestCaseUpdate? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _testCaseId = default;
            int _traceResponsesSize = default;
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
                    case "testCaseId":
                        _testCaseId = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "traceResponsesSize":
                        _traceResponsesSize = JsonSerializer.Deserialize<int>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new RecordedTestCaseUpdate
            {
                TestCaseId = _testCaseId,
                TraceResponsesSize = _traceResponsesSize,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            RecordedTestCaseUpdate value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("testCaseId");
            JsonSerializer.Serialize(writer, value.TestCaseId, options);
            writer.WritePropertyName("traceResponsesSize");
            JsonSerializer.Serialize(writer, value.TraceResponsesSize, options);
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

        public override RecordedTestCaseUpdate ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<RecordedTestCaseUpdate>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            RecordedTestCaseUpdate value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
