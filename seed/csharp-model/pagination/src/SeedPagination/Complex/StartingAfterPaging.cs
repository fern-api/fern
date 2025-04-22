using System.Text.Json.Serialization;
using System.Text.Json;
using SeedPagination.Core;

namespace SeedPagination;

public record StartingAfterPaging
{
    [JsonPropertyName("per_page")]
    public required int PerPage { get; set; }

    [JsonPropertyName("starting_after")]
    public string? StartingAfter { get; set; }

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
