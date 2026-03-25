using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(TestCaseNonHiddenGrade.JsonConverter))]
[Serializable]
public record TestCaseNonHiddenGrade
{
    [JsonPropertyName("passed")]
    public required bool Passed { get; set; }

    [JsonPropertyName("actualResult")]
    public VariableValue? ActualResult { get; set; }

    [JsonPropertyName("exception")]
    public ExceptionV2? Exception { get; set; }

    [JsonPropertyName("stdout")]
    public required string Stdout { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<TestCaseNonHiddenGrade>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(TestCaseNonHiddenGrade).IsAssignableFrom(typeToConvert);

        public override TestCaseNonHiddenGrade? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            bool _passed = default;
            VariableValue? _actualResult = default;
            ExceptionV2? _exception = default;
            string _stdout = default;
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
                    case "passed":
                        _passed = JsonSerializer.Deserialize<bool>(ref reader, options);
                        break;
                    case "actualResult":
                        _actualResult = JsonSerializer.Deserialize<VariableValue?>(
                            ref reader,
                            options
                        );
                        break;
                    case "exception":
                        _exception = JsonSerializer.Deserialize<ExceptionV2?>(ref reader, options);
                        break;
                    case "stdout":
                        _stdout = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new TestCaseNonHiddenGrade
            {
                Passed = _passed,
                ActualResult = _actualResult,
                Exception = _exception,
                Stdout = _stdout,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            TestCaseNonHiddenGrade value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("passed");
            JsonSerializer.Serialize(writer, value.Passed, options);
            if (value.ActualResult is not null)
            {
                writer.WritePropertyName("actualResult");
                JsonSerializer.Serialize(writer, value.ActualResult, options);
            }
            if (value.Exception is not null)
            {
                writer.WritePropertyName("exception");
                JsonSerializer.Serialize(writer, value.Exception, options);
            }
            writer.WritePropertyName("stdout");
            JsonSerializer.Serialize(writer, value.Stdout, options);
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

        public override TestCaseNonHiddenGrade ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<TestCaseNonHiddenGrade>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            TestCaseNonHiddenGrade value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
