using System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.V2;

#nullable enable

namespace SeedTrace.V2;

public record CreateProblemRequestV2
{
    [JsonPropertyName("problemName")]
    public required string ProblemName { get; }

    [JsonPropertyName("problemDescription")]
    public required ProblemDescription ProblemDescription { get; }

    [JsonPropertyName("customFiles")]
    public required object CustomFiles { get; }

    [JsonPropertyName("customTestCaseTemplates")]
    public IEnumerable<TestCaseTemplate> CustomTestCaseTemplates { get; } =
        new List<TestCaseTemplate>();

    [JsonPropertyName("testcases")]
    public IEnumerable<TestCaseV2> Testcases { get; } = new List<TestCaseV2>();

    [JsonPropertyName("supportedLanguages")]
    public HashSet<Language> SupportedLanguages { get; } = new HashSet<Language>();

    [JsonPropertyName("isPublic")]
    public required bool IsPublic { get; }
}
