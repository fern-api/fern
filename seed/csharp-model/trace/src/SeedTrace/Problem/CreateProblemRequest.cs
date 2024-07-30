using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

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
    public required object OutputType { get; set; }

    [JsonPropertyName("testcases")]
    public IEnumerable<TestCaseWithExpectedResult> Testcases { get; set; } =
        new List<TestCaseWithExpectedResult>();

    [JsonPropertyName("methodName")]
    public required string MethodName { get; set; }
}
