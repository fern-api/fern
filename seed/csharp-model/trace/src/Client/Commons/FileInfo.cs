using System.Text.Json.Serialization;

namespace Client;

public class FileInfo
{
    [JsonPropertyName("filename")]
    public string Filename { get; init; }

    [JsonPropertyName("contents")]
    public string Contents { get; init; }
}
