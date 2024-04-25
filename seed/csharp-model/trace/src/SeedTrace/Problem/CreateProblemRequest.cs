using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class CreateProblemRequest
{
    [JsonPropertyName("problemName")]
    public string ProblemName { get; init; }

    [JsonPropertyName("problemDescription")]
    public ProblemDescription ProblemDescription { get; init; }

    [JsonPropertyName("files")]
    public List<Dictionary<Language, ProblemFiles>> Files { get; init; }

    [JsonPropertyName("inputParams")]
    public List<List<VariableTypeAndName>> InputParams { get; init; }

    [JsonPropertyName("outputType")]
    public VariableType OutputType { get; init; }

    [JsonPropertyName("testcases")]
    public List<List<TestCaseWithExpectedResult>> Testcases { get; init; }

    [JsonPropertyName("methodName")]
    public string MethodName { get; init; }
}
