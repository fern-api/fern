using System.Text.Json.Serialization;

#nullable enable

namespace SeedPagination;

public class UsernameContainer
{
    [JsonPropertyName("results")]
    public IEnumerable<string> Results { get; init; }
}
