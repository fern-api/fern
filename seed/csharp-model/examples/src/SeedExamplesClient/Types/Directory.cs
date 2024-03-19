using System.Text.Json.Serialization
using SeedExamplesClient

namespace SeedExamplesClient

public class Directory
{
    [JsonPropertyName("name")]
    public string Name { get; init; }
    [JsonPropertyName("files")]
    public List<File>? Files { get; init; }
    [JsonPropertyName("directories")]
    public List<Directory>? Directories { get; init; }
}
