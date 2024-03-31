using System.Text.Json.Serialization;

namespace Client.V2;

public class FileInfoV2
{
    [JsonPropertyName("filename")]
    public string Filename { get; init; }

    [JsonPropertyName("directory")]
    public string Directory { get; init; }

    [JsonPropertyName("contents")]
    public string Contents { get; init; }

    [JsonPropertyName("editable")]
    public bool Editable { get; init; }
}
