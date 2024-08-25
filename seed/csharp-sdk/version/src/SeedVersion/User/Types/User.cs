using System.Text.Json.Serialization;
using SeedVersion.Core;

#nullable enable

namespace SeedVersion;

public record User
{
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("name")]
    public required string Name { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
