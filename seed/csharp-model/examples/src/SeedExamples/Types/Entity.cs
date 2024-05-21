using System.Text.Json.Serialization;
using OneOf;
using SeedExamples;

namespace SeedExamples;

public class Entity
{
    [JsonPropertyName("type")]
    public OneOf<BasicType, ComplexType> Type { get; init; }

    [JsonPropertyName("name")]
    public string Name { get; init; }
}
