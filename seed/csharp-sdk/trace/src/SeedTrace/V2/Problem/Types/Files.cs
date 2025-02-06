using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace.V2;

public record Files
{
    [JsonPropertyName("files")]
    public IEnumerable<FileInfoV2> Files_ { get; set; } = new List<FileInfoV2>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
