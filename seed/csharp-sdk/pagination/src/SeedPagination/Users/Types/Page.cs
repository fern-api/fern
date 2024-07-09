using System.Text.Json.Serialization;
using SeedPagination;

#nullable enable

namespace SeedPagination;

public record Page
{
    /// <summary>
    /// The current page
    /// </summary>
    [JsonPropertyName("page")]
    public required int Page_ { get; init; }

    [JsonPropertyName("next")]
    public NextPage? Next { get; init; }

    [JsonPropertyName("per_page")]
    public required int PerPage { get; init; }

    [JsonPropertyName("total_page")]
    public required int TotalPage { get; init; }
}
