using System.Text.Json.Serialization;
using SeedPagination;

namespace SeedPagination;

public class Page
{
    /// <summary>
    /// The current page
    /// </summary>
    [JsonPropertyName("page")]
    public int Page_ { get; init; }

    [JsonPropertyName("next")]
    public NextPage? Next { get; init; }

    [JsonPropertyName("per_page")]
    public int PerPage { get; init; }

    [JsonPropertyName("total_page")]
    public int TotalPage { get; init; }
}
