using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public record CreateProblemRequest
{
    [JsonPropertyName("problemName")]
    public required string ProblemName { get; init; }

    [JsonPropertyName("problemDescription")]
    public required ProblemDescription ProblemDescription { get; init; }

    [JsonPropertyName("files")]
    public Dictionary<Language, ProblemFiles> Files { get; init; } =
        new Dictionary<Language, ProblemFiles>();

    [JsonPropertyName("inputParams")]
    public IEnumerable<VariableTypeAndName> InputParams { get; init; } =
        new List<VariableTypeAndName>();

    [JsonPropertyName("outputType")]
    public required object OutputType { get; init; }

    [JsonPropertyName("testcases")]
    public IEnumerable<TestCaseWithExpectedResult> Testcases { get; init; } =
        new List<TestCaseWithExpectedResult>();

    [JsonPropertyName("methodName")]
    public required string MethodName { get; init; }
}
