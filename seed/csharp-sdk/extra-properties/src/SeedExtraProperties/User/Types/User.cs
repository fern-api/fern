using System.Text.Json.Serialization;
using SeedExtraProperties.Core;

#nullable enable

namespace SeedExtraProperties;

public record User
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
