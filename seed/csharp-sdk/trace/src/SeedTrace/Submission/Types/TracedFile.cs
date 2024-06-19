using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public class TracedFile
{
    [JsonPropertyName("filename")]
    public string Filename { get; init; }

    [JsonPropertyName("directory")]
    public string Directory { get; init; }
}
