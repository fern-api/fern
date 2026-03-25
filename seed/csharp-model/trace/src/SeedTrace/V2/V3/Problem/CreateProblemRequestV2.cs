using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.Core;

namespace SeedTrace.V2.V3;

[JsonConverter(typeof(CreateProblemRequestV2.JsonConverter))]
[Serializable]
public record CreateProblemRequestV2
{
    [JsonPropertyName("problemName")]
    public required string ProblemName { get; set; }

    [JsonPropertyName("problemDescription")]
    public required ProblemDescription ProblemDescription { get; set; }

    [JsonPropertyName("customFiles")]
    public required CustomFiles CustomFiles { get; set; }

    [JsonPropertyName("customTestCaseTemplates")]
    public IEnumerable<TestCaseTemplate> CustomTestCaseTemplates { get; set; } =
        new List<TestCaseTemplate>();

    [JsonPropertyName("testcases")]
    public IEnumerable<TestCaseV2> Testcases { get; set; } = new List<TestCaseV2>();

    [JsonPropertyName("supportedLanguages")]
    public HashSet<Language> SupportedLanguages { get; set; } = new HashSet<Language>();

    [JsonPropertyName("isPublic")]
    public required bool IsPublic { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<CreateProblemRequestV2>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(CreateProblemRequestV2).IsAssignableFrom(typeToConvert);

        public override CreateProblemRequestV2? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _problemName = default;
            ProblemDescription _problemDescription = default;
            CustomFiles _customFiles = default;
            IEnumerable<TestCaseTemplate> _customTestCaseTemplates = default;
            IEnumerable<TestCaseV2> _testcases = default;
            HashSet<Language> _supportedLanguages = default;
            bool _isPublic = default;
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
                    case "problemName":
                        _problemName = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "problemDescription":
                        _problemDescription = JsonSerializer.Deserialize<ProblemDescription>(
                            ref reader,
                            options
                        );
                        break;
                    case "customFiles":
                        _customFiles = JsonSerializer.Deserialize<CustomFiles>(ref reader, options);
                        break;
                    case "customTestCaseTemplates":
                        _customTestCaseTemplates = JsonSerializer.Deserialize<
                            IEnumerable<TestCaseTemplate>
                        >(ref reader, options);
                        break;
                    case "testcases":
                        _testcases = JsonSerializer.Deserialize<IEnumerable<TestCaseV2>>(
                            ref reader,
                            options
                        );
                        break;
                    case "supportedLanguages":
                        _supportedLanguages = JsonSerializer.Deserialize<HashSet<Language>>(
                            ref reader,
                            options
                        );
                        break;
                    case "isPublic":
                        _isPublic = JsonSerializer.Deserialize<bool>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new CreateProblemRequestV2
            {
                ProblemName = _problemName,
                ProblemDescription = _problemDescription,
                CustomFiles = _customFiles,
                CustomTestCaseTemplates = _customTestCaseTemplates,
                Testcases = _testcases,
                SupportedLanguages = _supportedLanguages,
                IsPublic = _isPublic,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            CreateProblemRequestV2 value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("problemName");
            JsonSerializer.Serialize(writer, value.ProblemName, options);
            writer.WritePropertyName("problemDescription");
            JsonSerializer.Serialize(writer, value.ProblemDescription, options);
            writer.WritePropertyName("customFiles");
            JsonSerializer.Serialize(writer, value.CustomFiles, options);
            writer.WritePropertyName("customTestCaseTemplates");
            JsonSerializer.Serialize(writer, value.CustomTestCaseTemplates, options);
            writer.WritePropertyName("testcases");
            JsonSerializer.Serialize(writer, value.Testcases, options);
            writer.WritePropertyName("supportedLanguages");
            JsonSerializer.Serialize(writer, value.SupportedLanguages, options);
            writer.WritePropertyName("isPublic");
            JsonSerializer.Serialize(writer, value.IsPublic, options);
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

        public override CreateProblemRequestV2 ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<CreateProblemRequestV2>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            CreateProblemRequestV2 value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
