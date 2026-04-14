using System.Text.Json.Serialization;
using SeedObject.Core;

namespace SeedObject;

[Serializable]
public record GetDiscriminatedUnionRequest
{
    [JsonPropertyName("bar")]
    public required DiscriminatedUnion1 Bar { get; set; }

    [JsonPropertyName("foo")]
    public required string Foo { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
