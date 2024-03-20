using System.Text.Json.Serialization;
using StringEnum;
using SeedTraceClient;
using SeedTraceClient.V2;

namespace SeedTraceClient;

public class WorkspaceStarterFilesResponseV2
{
    [JsonPropertyName("filesByLanguage")]
    public Dictionary<StringEnum<Language>, Files> FilesByLanguage { get; init; }
}
