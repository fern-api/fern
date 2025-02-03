using System.Text.Json.Serialization;
using SeedUnions.Core;

namespace SeedUnions;

public record Square
{
    [JsonPropertyName("length")]
    public required double Length { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
