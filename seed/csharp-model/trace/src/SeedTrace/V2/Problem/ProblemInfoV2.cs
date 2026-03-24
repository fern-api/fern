using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.Core;

namespace SeedTrace.V2;

[JsonConverter(typeof(ProblemInfoV2.JsonConverter))]
[Serializable]
public record ProblemInfoV2
{
    [JsonPropertyName("problemId")]
    public required string ProblemId { get; set; }

    [JsonPropertyName("problemDescription")]
    public required ProblemDescription ProblemDescription { get; set; }

    [JsonPropertyName("problemName")]
    public required string ProblemName { get; set; }

    [JsonPropertyName("problemVersion")]
    public required int ProblemVersion { get; set; }

    [JsonPropertyName("supportedLanguages")]
    public HashSet<Language> SupportedLanguages { get; set; } = new HashSet<Language>();

    [JsonPropertyName("customFiles")]
    public required CustomFiles CustomFiles { get; set; }

    [JsonPropertyName("generatedFiles")]
    public required GeneratedFiles GeneratedFiles { get; set; }

    [JsonPropertyName("customTestCaseTemplates")]
    public IEnumerable<TestCaseTemplate> CustomTestCaseTemplates { get; set; } =
        new List<TestCaseTemplate>();

    [JsonPropertyName("testcases")]
    public IEnumerable<TestCaseV2> Testcases { get; set; } = new List<TestCaseV2>();

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
    internal sealed class JsonConverter : JsonConverter<ProblemInfoV2>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(ProblemInfoV2).IsAssignableFrom(typeToConvert);

        public override ProblemInfoV2? Read(
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
            ProblemDescription _problemDescription = default;
            string _problemName = default;
            int _problemVersion = default;
            HashSet<Language> _supportedLanguages = default;
            CustomFiles _customFiles = default;
            GeneratedFiles _generatedFiles = default;
            IEnumerable<TestCaseTemplate> _customTestCaseTemplates = default;
            IEnumerable<TestCaseV2> _testcases = default;
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
                    case "problemId":
                        _problemId = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "problemDescription":
                        _problemDescription = JsonSerializer.Deserialize<ProblemDescription>(
                            ref reader,
                            options
                        );
                        break;
                    case "problemName":
                        _problemName = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "problemVersion":
                        _problemVersion = JsonSerializer.Deserialize<int>(ref reader, options);
                        break;
                    case "supportedLanguages":
                        _supportedLanguages = JsonSerializer.Deserialize<HashSet<Language>>(
                            ref reader,
                            options
                        );
                        break;
                    case "customFiles":
                        _customFiles = JsonSerializer.Deserialize<CustomFiles>(ref reader, options);
                        break;
                    case "generatedFiles":
                        _generatedFiles = JsonSerializer.Deserialize<GeneratedFiles>(
                            ref reader,
                            options
                        );
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
                    case "isPublic":
                        _isPublic = JsonSerializer.Deserialize<bool>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new ProblemInfoV2
            {
                ProblemId = _problemId,
                ProblemDescription = _problemDescription,
                ProblemName = _problemName,
                ProblemVersion = _problemVersion,
                SupportedLanguages = _supportedLanguages,
                CustomFiles = _customFiles,
                GeneratedFiles = _generatedFiles,
                CustomTestCaseTemplates = _customTestCaseTemplates,
                Testcases = _testcases,
                IsPublic = _isPublic,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            ProblemInfoV2 value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("problemId");
            JsonSerializer.Serialize(writer, value.ProblemId, options);
            writer.WritePropertyName("problemDescription");
            JsonSerializer.Serialize(writer, value.ProblemDescription, options);
            writer.WritePropertyName("problemName");
            JsonSerializer.Serialize(writer, value.ProblemName, options);
            writer.WritePropertyName("problemVersion");
            JsonSerializer.Serialize(writer, value.ProblemVersion, options);
            writer.WritePropertyName("supportedLanguages");
            JsonSerializer.Serialize(writer, value.SupportedLanguages, options);
            writer.WritePropertyName("customFiles");
            JsonSerializer.Serialize(writer, value.CustomFiles, options);
            writer.WritePropertyName("generatedFiles");
            JsonSerializer.Serialize(writer, value.GeneratedFiles, options);
            writer.WritePropertyName("customTestCaseTemplates");
            JsonSerializer.Serialize(writer, value.CustomTestCaseTemplates, options);
            writer.WritePropertyName("testcases");
            JsonSerializer.Serialize(writer, value.Testcases, options);
            writer.WritePropertyName("isPublic");
            JsonSerializer.Serialize(writer, value.IsPublic, options);
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

        public override ProblemInfoV2 ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<ProblemInfoV2>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            ProblemInfoV2 value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
