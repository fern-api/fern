using System.Text.Json;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

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
    public required object OutputType { get; set; }

    [JsonPropertyName("testcases")]
    public IEnumerable<TestCaseWithExpectedResult> Testcases { get; set; } =
        new List<TestCaseWithExpectedResult>();

    [JsonPropertyName("methodName")]
    public required string MethodName { get; set; }

    [JsonPropertyName("supportsCustomTestCases")]
    public required bool SupportsCustomTestCases { get; set; }

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } =
        new Dictionary<string, JsonElement>();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
