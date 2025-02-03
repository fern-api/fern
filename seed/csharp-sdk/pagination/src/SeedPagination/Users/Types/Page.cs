using System.Text.Json.Serialization;
using SeedPagination.Core;

namespace SeedPagination;

public record Page
{
    /// <summary>
    /// The current page
    /// </summary>
    [JsonPropertyName("page")]
    public required int Page_ { get; set; }

    [JsonPropertyName("next")]
    public NextPage? Next { get; set; }

    [JsonPropertyName("per_page")]
    public required int PerPage { get; set; }

    [JsonPropertyName("total_page")]
    public required int TotalPage { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
