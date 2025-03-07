using System.Text.Json;
using System.Text.Json.Serialization;
using SeedPagination.Core;

namespace SeedPagination;

public record CursorPages
{
    [JsonPropertyName("next")]
    public StartingAfterPaging? Next { get; set; }

    [JsonPropertyName("page")]
    public int? Page { get; set; }

    [JsonPropertyName("per_page")]
    public int? PerPage { get; set; }

    [JsonPropertyName("total_pages")]
    public int? TotalPages { get; set; }

    [JsonPropertyName("type")]
    public string Type { get; set; } = "pages";

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
