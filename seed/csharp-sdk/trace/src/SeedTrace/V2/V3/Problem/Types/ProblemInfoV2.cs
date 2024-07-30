using System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.V2.V3;

#nullable enable

namespace SeedTrace.V2.V3;

public record ProblemInfoV2
{
    [JsonPropertyName("problemId")]
    public required string ProblemId { get; }

    [JsonPropertyName("problemDescription")]
    public required ProblemDescription ProblemDescription { get; }

    [JsonPropertyName("problemName")]
    public required string ProblemName { get; }

    [JsonPropertyName("problemVersion")]
    public required int ProblemVersion { get; }

    [JsonPropertyName("supportedLanguages")]
    public HashSet<Language> SupportedLanguages { get; } = new HashSet<Language>();

    [JsonPropertyName("customFiles")]
    public required object CustomFiles { get; }

    [JsonPropertyName("generatedFiles")]
    public required GeneratedFiles GeneratedFiles { get; }

    [JsonPropertyName("customTestCaseTemplates")]
    public IEnumerable<TestCaseTemplate> CustomTestCaseTemplates { get; } =
        new List<TestCaseTemplate>();

    [JsonPropertyName("testcases")]
    public IEnumerable<TestCaseV2> Testcases { get; } = new List<TestCaseV2>();

    [JsonPropertyName("isPublic")]
    public required bool IsPublic { get; }
}
