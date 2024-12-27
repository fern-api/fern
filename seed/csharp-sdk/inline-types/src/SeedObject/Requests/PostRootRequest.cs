using System.Text.Json.Serialization;
using SeedObject.Core;

#nullable enable

namespace SeedObject;

public record PostRootRequest
{
    [JsonPropertyName("bar")]
    public required RequestTypeInlineType1 Bar { get; set; }

    [JsonPropertyName("foo")]
    public required string Foo { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
