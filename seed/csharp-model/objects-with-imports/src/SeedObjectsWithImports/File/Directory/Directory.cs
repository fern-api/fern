using System.Text.Json;
using System.Text.Json.Serialization;
using SeedObjectsWithImports.Core;

namespace SeedObjectsWithImports.File;

[Serializable]
public record Directory
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("files")]
    public IEnumerable<SeedObjectsWithImports.File>? Files { get; set; }

    [JsonPropertyName("directories")]
    public IEnumerable<Directory>? Directories { get; set; }

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    /// <remarks>
    /// [EXPERIMENTAL] This API is experimental and may change in future releases.
    /// </remarks>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } =
        new Dictionary<string, JsonElement>();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
