using System.Text.Json.Serialization;
using OneOf;
using SeedExamples;
using SeedExamples.Core;

#nullable enable

namespace SeedExamples;

public class ResponseType
{
    [JsonPropertyName("type")]
    [JsonConverter(typeof(OneOfSerializer<OneOf<BasicType, ComplexType>>))]
    public OneOf<BasicType, ComplexType> Type { get; init; }
}
