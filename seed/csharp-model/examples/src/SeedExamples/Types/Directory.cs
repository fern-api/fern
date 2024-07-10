using System.Text.Json.Serialization;
using SeedExamples;

#nullable enable

namespace SeedExamples;

public record Directory
{
    [JsonPropertyName("name")]
    public required string Name { get; init; }

    [JsonPropertyName("files")]
    public IEnumerable<File>? Files { get; init; }

    [JsonPropertyName("directories")]
    public IEnumerable<Directory>? Directories { get; init; }
}
