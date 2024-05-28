using System.Text.Json.Serialization;
using OneOf;
using SeedExamples;

#nullable enable

namespace SeedExamples;

public class Identifier
{
    [JsonPropertyName("type")]
    public OneOf<BasicType, ComplexType> Type { get; init; }

    [JsonPropertyName("value")]
    public string Value { get; init; }

    [JsonPropertyName("label")]
    public string Label { get; init; }
}
