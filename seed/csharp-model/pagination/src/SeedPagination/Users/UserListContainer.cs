using System.Text.Json.Serialization;
using SeedPagination;

namespace SeedPagination;

public class UserListContainer
{
    [JsonPropertyName("users")]
    public List<User> Users { get; init; }
}
