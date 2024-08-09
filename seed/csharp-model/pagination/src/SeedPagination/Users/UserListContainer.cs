using System.Text.Json.Serialization;

#nullable enable

namespace SeedPagination;

public record UserListContainer
{
    [JsonPropertyName("users")]
    public IEnumerable<User> Users { get; set; } = new List<User>();
}
