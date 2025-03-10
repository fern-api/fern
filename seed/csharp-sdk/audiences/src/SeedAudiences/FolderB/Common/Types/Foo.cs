using System.Text.Json;
using System.Text.Json.Serialization;
using SeedAudiences.Core;
using SeedAudiences.FolderC;

namespace SeedAudiences.FolderB;

public record Foo
{
    [JsonPropertyName("foo")]
    public FolderCFoo? Foo_ { get; set; }

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
