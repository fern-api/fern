using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(TestSubmissionState.JsonConverter))]
[Serializable]
public record TestSubmissionState
{
    [JsonPropertyName("problemId")]
    public required string ProblemId { get; set; }

    [JsonPropertyName("defaultTestCases")]
    public IEnumerable<TestCase> DefaultTestCases { get; set; } = new List<TestCase>();

    [JsonPropertyName("customTestCases")]
    public IEnumerable<TestCase> CustomTestCases { get; set; } = new List<TestCase>();

    [JsonPropertyName("status")]
    public required TestSubmissionStatus Status { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<TestSubmissionState>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(TestSubmissionState).IsAssignableFrom(typeToConvert);

        public override TestSubmissionState? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _problemId = default;
            IEnumerable<TestCase> _defaultTestCases = default;
            IEnumerable<TestCase> _customTestCases = default;
            TestSubmissionStatus _status = default;
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
                    case "problemId":
                        _problemId = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "defaultTestCases":
                        _defaultTestCases = JsonSerializer.Deserialize<IEnumerable<TestCase>>(
                            ref reader,
                            options
                        );
                        break;
                    case "customTestCases":
                        _customTestCases = JsonSerializer.Deserialize<IEnumerable<TestCase>>(
                            ref reader,
                            options
                        );
                        break;
                    case "status":
                        _status = JsonSerializer.Deserialize<TestSubmissionStatus>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new TestSubmissionState
            {
                ProblemId = _problemId,
                DefaultTestCases = _defaultTestCases,
                CustomTestCases = _customTestCases,
                Status = _status,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            TestSubmissionState value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("problemId");
            JsonSerializer.Serialize(writer, value.ProblemId, options);
            writer.WritePropertyName("defaultTestCases");
            JsonSerializer.Serialize(writer, value.DefaultTestCases, options);
            writer.WritePropertyName("customTestCases");
            JsonSerializer.Serialize(writer, value.CustomTestCases, options);
            writer.WritePropertyName("status");
            JsonSerializer.Serialize(writer, value.Status, options);
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

        public override TestSubmissionState ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<TestSubmissionState>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            TestSubmissionState value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
