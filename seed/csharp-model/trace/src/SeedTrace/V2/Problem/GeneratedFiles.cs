using System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.V2;

#nullable enable

namespace SeedTrace.V2;

public record GeneratedFiles
{
    [JsonPropertyName("generatedTestCaseFiles")]
    public Dictionary<Language, Files> GeneratedTestCaseFiles { get; } =
        new Dictionary<Language, Files>();

    [JsonPropertyName("generatedTemplateFiles")]
    public Dictionary<Language, Files> GeneratedTemplateFiles { get; } =
        new Dictionary<Language, Files>();

    [JsonPropertyName("other")]
    public Dictionary<Language, Files> Other { get; } = new Dictionary<Language, Files>();
}
