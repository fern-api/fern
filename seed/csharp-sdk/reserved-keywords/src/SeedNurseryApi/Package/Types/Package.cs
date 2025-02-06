using System.Text.Json.Serialization;
using SeedNurseryApi.Core;

namespace SeedNurseryApi;

public record Package
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
