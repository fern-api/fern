using System.Text.Json.Serialization;
using SeedPagination.Core;

namespace SeedPagination;

public record NextPage
{
    [JsonPropertyName("page")]
    public required int Page { get; set; }

    [JsonPropertyName("starting_after")]
    public required string StartingAfter { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
