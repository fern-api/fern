using System.Text.Json;
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

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } =
        new Dictionary<string, JsonElement>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
