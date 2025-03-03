using System.Text.Json.Serialization;
using SeedPagination.Core;

namespace SeedPagination;

public record UserPage
{
    [JsonPropertyName("data")]
    public required UserListContainer Data { get; set; }

    [JsonPropertyName("next")]
    public string? Next { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
