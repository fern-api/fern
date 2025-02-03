using System.Text.Json.Serialization;
using SeedQueryParameters.Core;

namespace SeedQueryParameters;

public record NestedUser
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("user")]
    public required User User { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
