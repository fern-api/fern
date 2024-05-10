using System.Text.Json.Serialization;
using SeedTrace.V2.V3;

namespace SeedTrace.V2.V3;

public class Files
{
    [JsonPropertyName("files")]
    public List<FileInfoV2> Files_ { get; init; }
}
