using System.Text.Json.Serialization;
using System.Text.Json;
using SeedPagination.Core;

namespace SeedPagination;

public record UsernamePage
{
    [JsonPropertyName("after")]
    public string? After { get; set; }

    [JsonPropertyName("data")]
    public IEnumerable<string> Data { get; set; } = new List<string>();

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
