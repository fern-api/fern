using System.Text.Json.Serialization;
using SeedPagination.Core;

namespace SeedPagination;

public record User
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("id")]
    public required int Id { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
