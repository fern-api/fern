using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(TestCaseResult.JsonConverter))]
[Serializable]
public record TestCaseResult
{
    [JsonPropertyName("expectedResult")]
    public required VariableValue ExpectedResult { get; set; }

    [JsonPropertyName("actualResult")]
    public required ActualResult ActualResult { get; set; }

    [JsonPropertyName("passed")]
    public required bool Passed { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<TestCaseResult>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(TestCaseResult).IsAssignableFrom(typeToConvert);

        public override TestCaseResult? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            VariableValue _expectedResult = default;
            ActualResult _actualResult = default;
            bool _passed = default;
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
                    case "expectedResult":
                        _expectedResult = JsonSerializer.Deserialize<VariableValue>(
                            ref reader,
                            options
                        );
                        break;
                    case "actualResult":
                        _actualResult = JsonSerializer.Deserialize<ActualResult>(
                            ref reader,
                            options
                        );
                        break;
                    case "passed":
                        _passed = JsonSerializer.Deserialize<bool>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new TestCaseResult
            {
                ExpectedResult = _expectedResult,
                ActualResult = _actualResult,
                Passed = _passed,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            TestCaseResult value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("expectedResult");
            JsonSerializer.Serialize(writer, value.ExpectedResult, options);
            writer.WritePropertyName("actualResult");
            JsonSerializer.Serialize(writer, value.ActualResult, options);
            writer.WritePropertyName("passed");
            JsonSerializer.Serialize(writer, value.Passed, options);
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

        public override TestCaseResult ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<TestCaseResult>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            TestCaseResult value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
