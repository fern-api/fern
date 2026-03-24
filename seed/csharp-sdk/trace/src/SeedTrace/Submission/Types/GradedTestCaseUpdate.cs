using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(GradedTestCaseUpdate.JsonConverter))]
[Serializable]
public record GradedTestCaseUpdate
{
    [JsonPropertyName("testCaseId")]
    public required string TestCaseId { get; set; }

    [JsonPropertyName("grade")]
    public required TestCaseGrade Grade { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<GradedTestCaseUpdate>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(GradedTestCaseUpdate).IsAssignableFrom(typeToConvert);

        public override GradedTestCaseUpdate? Read(
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
            TestCaseGrade _grade = default;
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
                    case "grade":
                        _grade = JsonSerializer.Deserialize<TestCaseGrade>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new GradedTestCaseUpdate
            {
                TestCaseId = _testCaseId,
                Grade = _grade,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            GradedTestCaseUpdate value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("testCaseId");
            JsonSerializer.Serialize(writer, value.TestCaseId, options);
            writer.WritePropertyName("grade");
            JsonSerializer.Serialize(writer, value.Grade, options);
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
