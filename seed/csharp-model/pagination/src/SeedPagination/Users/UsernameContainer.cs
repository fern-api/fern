using System.Text.Json.Serialization;

#nullable enable

namespace SeedPagination;

public record UsernameContainer
{
    [JsonPropertyName("results")]
    public IEnumerable<string> Results { get; init; } = new List<string>();
}
