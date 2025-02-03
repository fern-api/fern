using System.Text.Json.Serialization;
using SeedPagination.Core;

namespace SeedPagination;

public record StartingAfterPaging
{
    [JsonPropertyName("per_page")]
    public required int PerPage { get; set; }

    [JsonPropertyName("starting_after")]
    public string? StartingAfter { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
