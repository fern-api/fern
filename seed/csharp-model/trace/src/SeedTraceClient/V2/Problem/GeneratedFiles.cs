using System.Text.Json.Serialization
using StringEnum
using SeedTraceClient
using SeedTraceClient.V2

namespace SeedTraceClient.V2

public class GeneratedFiles
{
    [JsonPropertyName("generatedTestCaseFiles")]
    public Dictionary<StringEnum<Language>,Files> GeneratedTestCaseFiles { get; init; }
    [JsonPropertyName("generatedTemplateFiles")]
    public Dictionary<StringEnum<Language>,Files> GeneratedTemplateFiles { get; init; }
    [JsonPropertyName("other")]
    public Dictionary<StringEnum<Language>,Files> Other { get; init; }
}
