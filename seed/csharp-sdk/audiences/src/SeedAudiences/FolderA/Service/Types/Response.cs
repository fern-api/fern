using System.Text.Json;
using System.Text.Json.Serialization;
using SeedAudiences.Core;
using SeedAudiences.FolderB;

namespace SeedAudiences.FolderA;

public record Response
{
    [JsonPropertyName("foo")]
    public Foo? Foo { get; set; }

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } =
        new Dictionary<string, JsonElement>();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
