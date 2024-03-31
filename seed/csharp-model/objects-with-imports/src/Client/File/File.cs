using System.Text.Json.Serialization;
using StringEnum;
using Client;

namespace Client;

public class File
{
    [JsonPropertyName("name")]
    public string Name { get; init; }

    [JsonPropertyName("contents")]
    public string Contents { get; init; }

    [JsonPropertyName("info")]
    public StringEnum<FileInfo> Info { get; init; }
}
