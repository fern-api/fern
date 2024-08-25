using System.Text.Json.Serialization;
using SeedPagination.Core;

#nullable enable

namespace SeedPagination;

public record UserListContainer
{
    [JsonPropertyName("users")]
    public IEnumerable<User> Users { get; set; } = new List<User>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
