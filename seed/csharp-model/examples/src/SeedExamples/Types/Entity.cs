using System.Text.Json.Serialization;
using OneOf;
using SeedExamples;
using SeedExamples.Core;

#nullable enable

namespace SeedExamples;

public class Entity
{
    [JsonPropertyName("type")]
    [JsonConverter(typeof(OneOfSerializer<OneOf<BasicType, ComplexType>>))]
    public OneOf<BasicType, ComplexType> Type { get; init; }

    [JsonPropertyName("name")]
    public string Name { get; init; }
}
