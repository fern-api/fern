using System.Text.Json.Serialization;
using SeedObject.Core;

#nullable enable

namespace SeedObject;

public record AliasInlineValue
{
    [JsonPropertyName("foo")]
    public required string Foo { get; set; }

    [JsonPropertyName("bar")]
    public required string Bar { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
