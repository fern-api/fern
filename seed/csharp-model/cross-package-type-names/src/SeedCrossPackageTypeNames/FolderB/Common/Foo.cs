using System.Text.Json;
using System.Text.Json.Serialization;
using SeedCrossPackageTypeNames.Core;

namespace SeedCrossPackageTypeNames.FolderB;

public record Foo
{
    [JsonPropertyName("foo")]
    public FolderC.Foo? Foo_ { get; set; }

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties =
        new Dictionary<string, JsonElement>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
