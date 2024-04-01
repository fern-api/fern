using System.Text.Json.Serialization;
using StringEnum;
using SeedTrace;
using SeedTrace.V2;

namespace SeedTrace;

public class WorkspaceStarterFilesResponseV2
{
    [JsonPropertyName("filesByLanguage")]
    public Dictionary<StringEnum<Language>, Files> FilesByLanguage { get; init; }
}
