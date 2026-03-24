using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.Core;

namespace SeedTrace.V2;

[JsonConverter(typeof(GetGeneratedTestCaseFileRequest.JsonConverter))]
[Serializable]
public record GetGeneratedTestCaseFileRequest
{
    [JsonPropertyName("template")]
    public TestCaseTemplate? Template { get; set; }

    [JsonPropertyName("testCase")]
    public required TestCaseV2 TestCase { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<GetGeneratedTestCaseFileRequest>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(GetGeneratedTestCaseFileRequest).IsAssignableFrom(typeToConvert);

        public override GetGeneratedTestCaseFileRequest? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            TestCaseTemplate? _template = default;
            TestCaseV2 _testCase = default;
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
                    case "template":
                        _template = JsonSerializer.Deserialize<TestCaseTemplate?>(
                            ref reader,
                            options
                        );
                        break;
                    case "testCase":
                        _testCase = JsonSerializer.Deserialize<TestCaseV2>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new GetGeneratedTestCaseFileRequest
            {
                Template = _template,
                TestCase = _testCase,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            GetGeneratedTestCaseFileRequest value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            if (value.Template != null)
            {
                writer.WritePropertyName("template");
                JsonSerializer.Serialize(writer, value.Template, options);
            }
            writer.WritePropertyName("testCase");
            JsonSerializer.Serialize(writer, value.TestCase, options);
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

        public override GetGeneratedTestCaseFileRequest ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<GetGeneratedTestCaseFileRequest>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            GetGeneratedTestCaseFileRequest value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
