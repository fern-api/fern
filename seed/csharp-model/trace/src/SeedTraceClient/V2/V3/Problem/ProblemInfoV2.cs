using System.Text.Json.Serialization;
using SeedTraceClient;
using StringEnum;
using OneOf;
using SeedTraceClient.V2.V3;

namespace SeedTraceClient.V2.V3;

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
    public HashSet<StringEnum<Language>> SupportedLanguages { get; init; }

    [JsonPropertyName("customFiles")]
    public OneOf<CustomFiles._Basic, CustomFiles._Custom> CustomFiles { get; init; }

    [JsonPropertyName("generatedFiles")]
    public GeneratedFiles GeneratedFiles { get; init; }

    [JsonPropertyName("customTestCaseTemplates")]
    public List<TestCaseTemplate> CustomTestCaseTemplates { get; init; }

    [JsonPropertyName("testcases")]
    public List<TestCaseV2> Testcases { get; init; }

    [JsonPropertyName("isPublic")]
    public bool IsPublic { get; init; }
}
