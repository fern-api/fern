using System.Text.Json;
using System.Text.Json.Serialization;
using SeedPagination.Core;

namespace SeedPagination;

[Serializable]
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
