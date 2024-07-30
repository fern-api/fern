using System.Text.Json.Serialization;
using SeedTrace.V2;

#nullable enable

namespace SeedTrace.V2;

public record Files
{
    [JsonPropertyName("files")]
    public IEnumerable<FileInfoV2> Files_ { get; set; } = new List<FileInfoV2>();
}
