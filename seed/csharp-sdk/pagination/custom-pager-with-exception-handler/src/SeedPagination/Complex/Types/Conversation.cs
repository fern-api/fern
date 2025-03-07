using System.Text.Json;
using System.Text.Json.Serialization;
using SeedPagination.Core;

namespace SeedPagination;

public record Conversation
{
    [JsonPropertyName("foo")]
    public required string Foo { get; set; }

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
