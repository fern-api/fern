using System.Text.Json.Serialization;
using SeedExamples.Core;

namespace SeedExamples;

public record BigEntity
{
    [JsonPropertyName("extendedMovie")]
    public ExtendedMovie? ExtendedMovie { get; set; }

    [JsonPropertyName("test")]
    public object? Test { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
