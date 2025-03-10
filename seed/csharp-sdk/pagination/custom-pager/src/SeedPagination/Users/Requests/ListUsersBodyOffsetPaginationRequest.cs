using System.Text.Json;
using System.Text.Json.Serialization;
using SeedPagination.Core;

namespace SeedPagination;

public record ListUsersBodyOffsetPaginationRequest
{
    /// <summary>
    /// The object that contains the offset used for pagination
    /// in order to fetch the next page of results.
    /// </summary>
    [JsonPropertyName("pagination")]
    public WithPage? Pagination { get; set; }

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
