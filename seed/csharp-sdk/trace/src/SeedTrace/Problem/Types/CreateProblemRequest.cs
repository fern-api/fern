using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(CreateProblemRequest.JsonConverter))]
[Serializable]
public record CreateProblemRequest
{
    [JsonPropertyName("problemName")]
    public required string ProblemName { get; set; }

    [JsonPropertyName("problemDescription")]
    public required ProblemDescription ProblemDescription { get; set; }

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

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<CreateProblemRequest>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(CreateProblemRequest).IsAssignableFrom(typeToConvert);

        public override CreateProblemRequest? Read(
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
            Dictionary<Language, ProblemFiles> _files = default;
            IEnumerable<VariableTypeAndName> _inputParams = default;
            VariableType _outputType = default;
            IEnumerable<TestCaseWithExpectedResult> _testcases = default;
            string _methodName = default;
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
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new CreateProblemRequest
            {
                ProblemName = _problemName,
                ProblemDescription = _problemDescription,
                Files = _files,
                InputParams = _inputParams,
                OutputType = _outputType,
                Testcases = _testcases,
                MethodName = _methodName,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            CreateProblemRequest value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("problemName");
            JsonSerializer.Serialize(writer, value.ProblemName, options);
            writer.WritePropertyName("problemDescription");
            JsonSerializer.Serialize(writer, value.ProblemDescription, options);
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

        public override CreateProblemRequest ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<CreateProblemRequest>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            CreateProblemRequest value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
