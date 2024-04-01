using System.Text.Json.Serialization;
using StringEnum;
using SeedTrace;
using SeedTrace.V2.V3;

namespace SeedTrace.V2.V3;

public class GeneratedFiles
{
    [JsonPropertyName("generatedTestCaseFiles")]
    public Dictionary<StringEnum<Language>, Files> GeneratedTestCaseFiles { get; init; }

    [JsonPropertyName("generatedTemplateFiles")]
    public Dictionary<StringEnum<Language>, Files> GeneratedTemplateFiles { get; init; }

    [JsonPropertyName("other")]
    public Dictionary<StringEnum<Language>, Files> Other { get; init; }
}
