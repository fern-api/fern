using System.Text.Json.Serialization;

namespace SeedPagination;

public class UsernameContainer
{
    [JsonPropertyName("results")]
    public List<List<string>> Results { get; init; }
}
