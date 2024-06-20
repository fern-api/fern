using System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.V2.V3;

#nullable enable

namespace SeedTrace.V2.V3;

public class ProblemInfoV2
{
    [JsonPropertyName("problemId")]
    public string ProblemId { get; init; }

    [JsonPropertyName("problemDescription")]
    public ProblemDescription ProblemDescription { get; init; }

    [JsonPropertyName("problemName")]
    public string ProblemName { get; init; }

    [JsonPropertyName("problemVersion")]
    public int ProblemVersion { get; init; }

    [JsonPropertyName("supportedLanguages")]
    public HashSet<Language> SupportedLanguages { get; init; }

    [JsonPropertyName("customFiles")]
    public object CustomFiles { get; init; }

    [JsonPropertyName("generatedFiles")]
    public GeneratedFiles GeneratedFiles { get; init; }

    [JsonPropertyName("customTestCaseTemplates")]
    public IEnumerable<TestCaseTemplate> CustomTestCaseTemplates { get; init; }

    [JsonPropertyName("testcases")]
    public IEnumerable<TestCaseV2> Testcases { get; init; }

    [JsonPropertyName("isPublic")]
    public bool IsPublic { get; init; }
}
