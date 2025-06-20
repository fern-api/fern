using System.Text.Json;
using System.Text.Json.Serialization;
using SeedAudiences.Core;
using SeedAudiences.FolderC;

namespace SeedAudiences.FolderB;

[Serializable]
public record Foo
{
    [JsonPropertyName("foo")]
    public FolderCFoo? Foo_ { get; set; }

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
