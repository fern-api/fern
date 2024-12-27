using System.Text.Json.Serialization;
using SeedObject.Core;

#nullable enable

namespace SeedObject;

public record GetDiscriminatedUnionRequest
{
    [JsonPropertyName("bar")]
    public required object Bar { get; set; }

    [JsonPropertyName("foo")]
    public required string Foo { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
