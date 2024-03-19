using System.Text.Json.Serialization
using SeedTraceClient.V2

namespace SeedTraceClient.V2

public class Files
{
    [JsonPropertyName("files")]
    public List<FileInfoV2> Files { get; init; }
}
