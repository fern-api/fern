using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public record ProblemInfo
{
    [JsonPropertyName("problemId")]
    public required string ProblemId { get; }

    [JsonPropertyName("problemDescription")]
    public required ProblemDescription ProblemDescription { get; }

    [JsonPropertyName("problemName")]
    public required string ProblemName { get; }

    [JsonPropertyName("problemVersion")]
    public required int ProblemVersion { get; }

    [JsonPropertyName("files")]
    public Dictionary<Language, ProblemFiles> Files { get; } =
        new Dictionary<Language, ProblemFiles>();

    [JsonPropertyName("inputParams")]
    public IEnumerable<VariableTypeAndName> InputParams { get; } = new List<VariableTypeAndName>();

    [JsonPropertyName("outputType")]
    public required object OutputType { get; }

    [JsonPropertyName("testcases")]
    public IEnumerable<TestCaseWithExpectedResult> Testcases { get; } =
        new List<TestCaseWithExpectedResult>();

    [JsonPropertyName("methodName")]
    public required string MethodName { get; }

    [JsonPropertyName("supportsCustomTestCases")]
    public required bool SupportsCustomTestCases { get; }
}
