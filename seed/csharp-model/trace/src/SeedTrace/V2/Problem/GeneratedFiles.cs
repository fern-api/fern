using System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.V2;

namespace SeedTrace.V2;

public class GeneratedFiles
{
    [JsonPropertyName("generatedTestCaseFiles")]
    public List<Dictionary<Language, Files>> GeneratedTestCaseFiles { get; init; }

    [JsonPropertyName("generatedTemplateFiles")]
    public List<Dictionary<Language, Files>> GeneratedTemplateFiles { get; init; }

    [JsonPropertyName("other")]
    public List<Dictionary<Language, Files>> Other { get; init; }
}
