using System.Text.Json.Serialization;
using SeedPagination;

#nullable enable

namespace SeedPagination;

public record UserListContainer
{
    [JsonPropertyName("users")]
    public IEnumerable<User> Users { get; } = new List<User>();
}
