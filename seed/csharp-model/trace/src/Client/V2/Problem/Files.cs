using System.Text.Json.Serialization;
using Client.V2;

namespace Client.V2;

public class Files
{
    [JsonPropertyName("files")]
    public List<FileInfoV2> Files { get; init; }
}
