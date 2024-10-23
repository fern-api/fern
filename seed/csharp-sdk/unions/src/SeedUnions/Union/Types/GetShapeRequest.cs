using System.Text.Json.Serialization;
using SeedUnions.Core;

#nullable enable

namespace SeedUnions;

public record GetShapeRequest
{
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
