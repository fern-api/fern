using System.Text.Json.Serialization;
using SeedObject.Core;

namespace SeedObject;

[Serializable]
public record PostRootRequest
{
    [JsonPropertyName("bar")]
    public required RequestTypeInlineType1 Bar { get; set; }

    [JsonPropertyName("foo")]
    public required string Foo { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
