using System.Text.Json.Serialization;

namespace Client;

public class TracedFile
{
    [JsonPropertyName("filename")]
    public string Filename { get; init; }

    [JsonPropertyName("directory")]
    public string Directory { get; init; }
}
