using System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.V2.V3;

#nullable enable

namespace SeedTrace.V2.V3;

public class CreateProblemRequestV2
{
    [JsonPropertyName("problemName")]
    public string ProblemName { get; init; }

    [JsonPropertyName("problemDescription")]
    public ProblemDescription ProblemDescription { get; init; }

    [JsonPropertyName("customFiles")]
    public CustomFiles CustomFiles { get; init; }

    [JsonPropertyName("customTestCaseTemplates")]
    public IEnumerable<TestCaseTemplate> CustomTestCaseTemplates { get; init; }

    [JsonPropertyName("testcases")]
    public IEnumerable<TestCaseV2> Testcases { get; init; }

    [JsonPropertyName("supportedLanguages")]
    public HashSet<Language> SupportedLanguages { get; init; }

    [JsonPropertyName("isPublic")]
    public bool IsPublic { get; init; }
}
