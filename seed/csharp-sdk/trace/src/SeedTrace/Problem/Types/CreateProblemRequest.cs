using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public class CreateProblemRequest
{
    [JsonPropertyName("problemName")]
    public string ProblemName { get; init; }

    [JsonPropertyName("problemDescription")]
    public ProblemDescription ProblemDescription { get; init; }

    [JsonPropertyName("files")]
    public Dictionary<Language, ProblemFiles> Files { get; init; }

    [JsonPropertyName("inputParams")]
    public IEnumerable<VariableTypeAndName> InputParams { get; init; }

    [JsonPropertyName("outputType")]
    public VariableType OutputType { get; init; }

    [JsonPropertyName("testcases")]
    public IEnumerable<TestCaseWithExpectedResult> Testcases { get; init; }

    [JsonPropertyName("methodName")]
    public string MethodName { get; init; }
}
