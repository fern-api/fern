using System.Text.Json.Serialization;
using OneOf;
using SeedExamples;
using SeedExamples.Core;

#nullable enable

namespace SeedExamples;

public record Entity
{
    [JsonPropertyName("type")]
    [JsonConverter(typeof(OneOfSerializer<OneOf<BasicType, ComplexType>>))]
    public required OneOf<BasicType, ComplexType> Type { get; set; }

    [JsonPropertyName("name")]
    public required string Name { get; set; }
}
