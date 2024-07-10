using System.Text.Json.Serialization;
using OneOf;
using SeedExamples;
using SeedExamples.Core;

#nullable enable

namespace SeedExamples;

public record Identifier
{
    [JsonPropertyName("type")]
    [JsonConverter(typeof(OneOfSerializer<OneOf<BasicType, ComplexType>>))]
    public required OneOf<BasicType, ComplexType> Type { get; init; }

    [JsonPropertyName("value")]
    public required string Value { get; init; }

    [JsonPropertyName("label")]
    public required string Label { get; init; }
}
