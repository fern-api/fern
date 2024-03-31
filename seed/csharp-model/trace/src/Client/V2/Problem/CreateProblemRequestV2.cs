using System.Text.Json.Serialization;
using Client;
using OneOf;
using Client.V2;
using StringEnum;

namespace Client.V2;

public class CreateProblemRequestV2
{
    [JsonPropertyName("problemName")]
    public string ProblemName { get; init; }

    [JsonPropertyName("problemDescription")]
    public ProblemDescription ProblemDescription { get; init; }

    [JsonPropertyName("customFiles")]
    public OneOf<CustomFiles._Basic, CustomFiles._Custom> CustomFiles { get; init; }

    [JsonPropertyName("customTestCaseTemplates")]
    public List<TestCaseTemplate> CustomTestCaseTemplates { get; init; }

    [JsonPropertyName("testcases")]
    public List<TestCaseV2> Testcases { get; init; }

    [JsonPropertyName("supportedLanguages")]
    public HashSet<StringEnum<Language>> SupportedLanguages { get; init; }

    [JsonPropertyName("isPublic")]
    public bool IsPublic { get; init; }
}
