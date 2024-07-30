using System.Text.Json.Serialization;
using SeedExamples;

#nullable enable

namespace SeedExamples;

public record Directory
{
    [JsonPropertyName("name")]
    public required string Name { get; }

    [JsonPropertyName("files")]
    public IEnumerable<File>? Files { get; }

    [JsonPropertyName("directories")]
    public IEnumerable<Directory>? Directories { get; }
}
