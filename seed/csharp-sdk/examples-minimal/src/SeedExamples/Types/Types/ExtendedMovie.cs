using System.Text.Json.Serialization;
using SeedExamples.Core;

namespace SeedExamples;

public record ExtendedMovie
{
    [JsonPropertyName("cast")]
    public IEnumerable<string> Cast { get; set; } = new List<string>();

    [JsonPropertyName("foo")]
    public required string Foo { get; set; }

    [JsonPropertyName("bar")]
    public required int Bar { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
