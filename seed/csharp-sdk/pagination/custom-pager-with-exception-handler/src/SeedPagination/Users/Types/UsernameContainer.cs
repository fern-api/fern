using System.Text.Json;
using System.Text.Json.Serialization;
using SeedPagination.Core;

namespace SeedPagination;

public record UsernameContainer
{
    [JsonPropertyName("results")]
    public IEnumerable<string> Results { get; set; } = new List<string>();

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
