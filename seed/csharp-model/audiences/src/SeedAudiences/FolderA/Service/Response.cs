using System.Text.Json.Serialization;
using SeedAudiences.FolderB;
using System.Text.Json;
using SeedAudiences.Core;

namespace SeedAudiences.FolderA;

public record Response
{
    [JsonPropertyName("foo")]
    public Foo? Foo { get; set; }

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    /// <remarks>
    /// [EXPERIMENTAL] This API is experimental and may change in future releases.
    /// </remarks>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } = new Dictionary<string, JsonElement>();
    /// <inheritdoc />
    public override string ToString() {
        return JsonUtils.Serialize(this);
    }

}
