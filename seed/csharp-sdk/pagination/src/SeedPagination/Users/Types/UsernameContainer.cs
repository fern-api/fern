using System.Text.Json.Serialization;

namespace SeedPagination;

public class UsernameContainer
{
    [JsonPropertyName("results")]
    public List<string> Results { get; init; }
}
