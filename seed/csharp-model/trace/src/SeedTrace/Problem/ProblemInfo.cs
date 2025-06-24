using System.Text.Json;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[Serializable]
public record ProblemInfo : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

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

    void IJsonOnDeserialized.OnDeserialized() =>
        AdditionalProperties.CopyFromExtensionData(_extensionData);

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
