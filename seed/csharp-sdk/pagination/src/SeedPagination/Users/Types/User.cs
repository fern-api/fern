using System.Text.Json.Serialization;

#nullable enable

namespace SeedPagination;

public class User
{
    [JsonPropertyName("name")]
    public string Name { get; init; }

    [JsonPropertyName("id")]
    public int Id { get; init; }
}
