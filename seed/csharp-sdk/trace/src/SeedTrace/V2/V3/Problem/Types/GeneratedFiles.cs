using System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.V2.V3;

#nullable enable

namespace SeedTrace.V2.V3;

public class GeneratedFiles
{
    [JsonPropertyName("generatedTestCaseFiles")]
    public Dictionary<Language, Files> GeneratedTestCaseFiles { get; init; }

    [JsonPropertyName("generatedTemplateFiles")]
    public Dictionary<Language, Files> GeneratedTemplateFiles { get; init; }

    [JsonPropertyName("other")]
    public Dictionary<Language, Files> Other { get; init; }
}
