using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(ProblemInfo.JsonConverter))]
[Serializable]
public record ProblemInfo
{
    [JsonPropertyName("problemId")]
    public required string ProblemId { get; set; }

    [JsonPropertyName("problemDescription")]
    public required ProblemDescription ProblemDescription { get; set; }

    [JsonPropertyName("problemName")]
    public required string ProblemName { get; set; }

    [JsonPropertyName("problemVersion")]
    public required int ProblemVersion { get; set; }

    [JsonPropertyName("files")]
    public Dictionary<Language, ProblemFiles> Files { get; set; } =
        new Dictionary<Language, ProblemFiles>();

    [JsonPropertyName("inputParams")]
    public IEnumerable<VariableTypeAndName> InputParams { get; set; } =
        new List<VariableTypeAndName>();

    [JsonPropertyName("outputType")]
    public required VariableType OutputType { get; set; }

    [JsonPropertyName("testcases")]
    public IEnumerable<TestCaseWithExpectedResult> Testcases { get; set; } =
        new List<TestCaseWithExpectedResult>();

    [JsonPropertyName("methodName")]
    public required string MethodName { get; set; }

    [JsonPropertyName("supportsCustomTestCases")]
    public required bool SupportsCustomTestCases { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<ProblemInfo>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(ProblemInfo).IsAssignableFrom(typeToConvert);

        public override ProblemInfo? Read(
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
            Dictionary<Language, ProblemFiles> _files = default;
            IEnumerable<VariableTypeAndName> _inputParams = default;
            VariableType _outputType = default;
            IEnumerable<TestCaseWithExpectedResult> _testcases = default;
            string _methodName = default;
            bool _supportsCustomTestCases = default;
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
                    case "files":
                        _files = JsonSerializer.Deserialize<Dictionary<Language, ProblemFiles>>(
                            ref reader,
                            options
                        );
                        break;
                    case "inputParams":
                        _inputParams = JsonSerializer.Deserialize<IEnumerable<VariableTypeAndName>>(
                            ref reader,
                            options
                        );
                        break;
                    case "outputType":
                        _outputType = JsonSerializer.Deserialize<VariableType>(ref reader, options);
                        break;
                    case "testcases":
                        _testcases = JsonSerializer.Deserialize<
                            IEnumerable<TestCaseWithExpectedResult>
                        >(ref reader, options);
                        break;
                    case "methodName":
                        _methodName = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "supportsCustomTestCases":
                        _supportsCustomTestCases = JsonSerializer.Deserialize<bool>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new ProblemInfo
            {
                ProblemId = _problemId,
                ProblemDescription = _problemDescription,
                ProblemName = _problemName,
                ProblemVersion = _problemVersion,
                Files = _files,
                InputParams = _inputParams,
                OutputType = _outputType,
                Testcases = _testcases,
                MethodName = _methodName,
                SupportsCustomTestCases = _supportsCustomTestCases,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            ProblemInfo value,
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
            writer.WritePropertyName("files");
            JsonSerializer.Serialize(writer, value.Files, options);
            writer.WritePropertyName("inputParams");
            JsonSerializer.Serialize(writer, value.InputParams, options);
            writer.WritePropertyName("outputType");
            JsonSerializer.Serialize(writer, value.OutputType, options);
            writer.WritePropertyName("testcases");
            JsonSerializer.Serialize(writer, value.Testcases, options);
            writer.WritePropertyName("methodName");
            JsonSerializer.Serialize(writer, value.MethodName, options);
            writer.WritePropertyName("supportsCustomTestCases");
            JsonSerializer.Serialize(writer, value.SupportsCustomTestCases, options);
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

        public override ProblemInfo ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<ProblemInfo>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            ProblemInfo value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
