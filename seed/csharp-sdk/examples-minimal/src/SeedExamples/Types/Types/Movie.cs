using System.Text.Json.Serialization;
using SeedExamples.Core;

namespace SeedExamples;

public record Movie
{
    [JsonPropertyName("foo")]
    public required string Foo { get; set; }

    [JsonPropertyName("bar")]
    public required int Bar { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
