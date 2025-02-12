using System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.Core;

namespace SeedTrace.V2.V3;

public record ProblemInfoV2
{
    [JsonPropertyName("problemId")]
    public required string ProblemId { get; set; }

    [JsonPropertyName("problemDescription")]
    public required ProblemDescription ProblemDescription { get; set; }

    [JsonPropertyName("problemName")]
    public required string ProblemName { get; set; }

    [JsonPropertyName("problemVersion")]
    public required int ProblemVersion { get; set; }

    [JsonPropertyName("supportedLanguages")]
    public HashSet<Language> SupportedLanguages { get; set; } = new HashSet<Language>();

    [JsonPropertyName("customFiles")]
    public required object CustomFiles { get; set; }

    [JsonPropertyName("generatedFiles")]
    public required GeneratedFiles GeneratedFiles { get; set; }

    [JsonPropertyName("customTestCaseTemplates")]
    public IEnumerable<TestCaseTemplate> CustomTestCaseTemplates { get; set; } =
        new List<TestCaseTemplate>();

    [JsonPropertyName("testcases")]
    public IEnumerable<TestCaseV2> Testcases { get; set; } = new List<TestCaseV2>();

    [JsonPropertyName("isPublic")]
    public required bool IsPublic { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
