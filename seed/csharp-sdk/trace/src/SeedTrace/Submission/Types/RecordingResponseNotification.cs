using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(RecordingResponseNotification.JsonConverter))]
[Serializable]
public record RecordingResponseNotification
{
    [JsonPropertyName("submissionId")]
    public required string SubmissionId { get; set; }

    [JsonPropertyName("testCaseId")]
    public string? TestCaseId { get; set; }

    [JsonPropertyName("lineNumber")]
    public required int LineNumber { get; set; }

    [JsonPropertyName("lightweightStackInfo")]
    public required LightweightStackframeInformation LightweightStackInfo { get; set; }

    [JsonPropertyName("tracedFile")]
    public TracedFile? TracedFile { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<RecordingResponseNotification>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(RecordingResponseNotification).IsAssignableFrom(typeToConvert);

        public override RecordingResponseNotification? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _submissionId = default;
            string? _testCaseId = default;
            int _lineNumber = default;
            LightweightStackframeInformation _lightweightStackInfo = default;
            TracedFile? _tracedFile = default;
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
                    case "submissionId":
                        _submissionId = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "testCaseId":
                        _testCaseId = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "lineNumber":
                        _lineNumber = JsonSerializer.Deserialize<int>(ref reader, options);
                        break;
                    case "lightweightStackInfo":
                        _lightweightStackInfo =
                            JsonSerializer.Deserialize<LightweightStackframeInformation>(
                                ref reader,
                                options
                            );
                        break;
                    case "tracedFile":
                        _tracedFile = JsonSerializer.Deserialize<TracedFile?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new RecordingResponseNotification
            {
                SubmissionId = _submissionId,
                TestCaseId = _testCaseId,
                LineNumber = _lineNumber,
                LightweightStackInfo = _lightweightStackInfo,
                TracedFile = _tracedFile,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            RecordingResponseNotification value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("submissionId");
            JsonSerializer.Serialize(writer, value.SubmissionId, options);
            if (value.TestCaseId != null)
            {
                writer.WritePropertyName("testCaseId");
                JsonSerializer.Serialize(writer, value.TestCaseId, options);
            }
            writer.WritePropertyName("lineNumber");
            JsonSerializer.Serialize(writer, value.LineNumber, options);
            writer.WritePropertyName("lightweightStackInfo");
            JsonSerializer.Serialize(writer, value.LightweightStackInfo, options);
            if (value.TracedFile != null)
            {
                writer.WritePropertyName("tracedFile");
                JsonSerializer.Serialize(writer, value.TracedFile, options);
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
    }
}
