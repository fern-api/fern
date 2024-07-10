using System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.V2.V3;

#nullable enable

namespace SeedTrace.V2.V3;

public record CreateProblemRequestV2
{
    [JsonPropertyName("problemName")]
    public required string ProblemName { get; init; }

    [JsonPropertyName("problemDescription")]
    public required ProblemDescription ProblemDescription { get; init; }

    [JsonPropertyName("customFiles")]
    public required object CustomFiles { get; init; }

    [JsonPropertyName("customTestCaseTemplates")]
    public IEnumerable<TestCaseTemplate> CustomTestCaseTemplates { get; init; } =
        new List<TestCaseTemplate>();

    [JsonPropertyName("testcases")]
    public IEnumerable<TestCaseV2> Testcases { get; init; } = new List<TestCaseV2>();

    [JsonPropertyName("supportedLanguages")]
    public HashSet<Language> SupportedLanguages { get; init; } = new HashSet<Language>();

    [JsonPropertyName("isPublic")]
    public required bool IsPublic { get; init; }
}
