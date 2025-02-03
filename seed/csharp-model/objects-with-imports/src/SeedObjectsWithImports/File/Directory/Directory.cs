using System.Text.Json.Serialization;
using SeedObjectsWithImports.Core;

namespace SeedObjectsWithImports.File;

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
