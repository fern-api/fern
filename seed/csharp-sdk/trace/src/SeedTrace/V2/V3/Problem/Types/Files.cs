using System.Text.Json.Serialization;
using SeedTrace.V2.V3;

#nullable enable

namespace SeedTrace.V2.V3;

public class Files
{
    [JsonPropertyName("files")]
    public IEnumerable<FileInfoV2> Files_ { get; init; }
}
