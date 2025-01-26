using System.Text.Json.Serialization;
using SeedPagination.Core;

#nullable enable

namespace SeedPagination;

public record ListUsersMixedTypePaginationResponse
{
    [JsonPropertyName("next")]
    public required string Next { get; set; }

    [JsonPropertyName("data")]
    public IEnumerable<User> Data { get; set; } = new List<User>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
