using System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.Core;

namespace SeedTrace.V2;

public record GeneratedFiles
{
    [JsonPropertyName("generatedTestCaseFiles")]
    public Dictionary<Language, Files> GeneratedTestCaseFiles { get; set; } =
        new Dictionary<Language, Files>();

    [JsonPropertyName("generatedTemplateFiles")]
    public Dictionary<Language, Files> GeneratedTemplateFiles { get; set; } =
        new Dictionary<Language, Files>();

    [JsonPropertyName("other")]
    public Dictionary<Language, Files> Other { get; set; } = new Dictionary<Language, Files>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
