using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(TestCaseWithExpectedResult.JsonConverter))]
[Serializable]
public record TestCaseWithExpectedResult
{
    [JsonPropertyName("testCase")]
    public required TestCase TestCase { get; set; }

    [JsonPropertyName("expectedResult")]
    public required VariableValue ExpectedResult { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<TestCaseWithExpectedResult>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(TestCaseWithExpectedResult).IsAssignableFrom(typeToConvert);

        public override TestCaseWithExpectedResult? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            TestCase _testCase = default;
            VariableValue _expectedResult = default;
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
                    case "testCase":
                        _testCase = JsonSerializer.Deserialize<TestCase>(ref reader, options);
                        break;
                    case "expectedResult":
                        _expectedResult = JsonSerializer.Deserialize<VariableValue>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new TestCaseWithExpectedResult
            {
                TestCase = _testCase,
                ExpectedResult = _expectedResult,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            TestCaseWithExpectedResult value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("testCase");
            JsonSerializer.Serialize(writer, value.TestCase, options);
            writer.WritePropertyName("expectedResult");
            JsonSerializer.Serialize(writer, value.ExpectedResult, options);
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

        public override TestCaseWithExpectedResult ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<TestCaseWithExpectedResult>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            TestCaseWithExpectedResult value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
