using System.Text.Json.Serialization;
using SeedExamples.Core;

namespace SeedExamples;

public record Directory
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("files")]
    public IEnumerable<File>? Files { get; set; }

    [JsonPropertyName("directories")]
    public IEnumerable<Directory>? Directories { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
