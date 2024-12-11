using System.Text.Json.Serialization;
using SeedObject.Core;

#nullable enable

namespace SeedObject;

public record InlineType2
{
    [JsonPropertyName("baz")]
    public required string Baz { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
