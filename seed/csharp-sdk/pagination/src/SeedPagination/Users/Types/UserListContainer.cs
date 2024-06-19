using System.Text.Json.Serialization;
using SeedPagination;

#nullable enable

namespace SeedPagination;

public class UserListContainer
{
    [JsonPropertyName("users")]
    public IEnumerable<User> Users { get; init; }
}
