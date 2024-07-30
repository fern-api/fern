using System.Text.Json.Serialization;

#nullable enable

namespace SeedPagination;

public record NextPage
{
    [JsonPropertyName("page")]
    public required int Page { get; }

    [JsonPropertyName("starting_after")]
    public required string StartingAfter { get; }
}
