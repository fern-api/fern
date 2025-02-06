using System.Text.Json.Serialization;
using SeedStreaming.Core;

namespace SeedStreaming;

public record StreamResponse
{
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("name")]
    public string? Name { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
