using System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.V2.V3;

#nullable enable

namespace SeedTrace.V2.V3;

public record ProblemInfoV2
{
    [JsonPropertyName("problemId")]
    public required string ProblemId { get; init; }

    [JsonPropertyName("problemDescription")]
    public required ProblemDescription ProblemDescription { get; init; }

    [JsonPropertyName("problemName")]
    public required string ProblemName { get; init; }

    [JsonPropertyName("problemVersion")]
    public required int ProblemVersion { get; init; }

    [JsonPropertyName("supportedLanguages")]
    public HashSet<Language> SupportedLanguages { get; init; } = new HashSet<Language>();

    [JsonPropertyName("customFiles")]
    public required object CustomFiles { get; init; }

    [JsonPropertyName("generatedFiles")]
    public required GeneratedFiles GeneratedFiles { get; init; }

    [JsonPropertyName("customTestCaseTemplates")]
    public IEnumerable<TestCaseTemplate> CustomTestCaseTemplates { get; init; } =
        new List<TestCaseTemplate>();

    [JsonPropertyName("testcases")]
    public IEnumerable<TestCaseV2> Testcases { get; init; } = new List<TestCaseV2>();

    [JsonPropertyName("isPublic")]
    public required bool IsPublic { get; init; }
}
