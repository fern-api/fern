using System.Text.Json.Serialization;
using SeedPagination.Core;

namespace SeedPagination;

public record UserOptionalListPage
{
    [JsonPropertyName("data")]
    public required UserOptionalListContainer Data { get; set; }

    [JsonPropertyName("next")]
    public string? Next { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
