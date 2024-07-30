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
    public required int Page_ { get; }

    [JsonPropertyName("next")]
    public NextPage? Next { get; }

    [JsonPropertyName("per_page")]
    public required int PerPage { get; }

    [JsonPropertyName("total_page")]
    public required int TotalPage { get; }
}
