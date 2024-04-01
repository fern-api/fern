using System.Text.Json.Serialization;
using Client;
using Client.File;

namespace Client.File;

public class Directory
{
    [JsonPropertyName("name")]
    public string Name { get; init; }

    [JsonPropertyName("files")]
    public List<File>? Files { get; init; }

    [JsonPropertyName("directories")]
    public List<Directory>? Directories { get; init; }
}
