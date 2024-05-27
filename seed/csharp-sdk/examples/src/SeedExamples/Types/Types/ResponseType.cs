using System.Text.Json.Serialization;
using OneOf;
using SeedExamples;

namespace SeedExamples;

public class ResponseType
{
    [JsonPropertyName("type")]
    public OneOf<BasicType, ComplexType> Type { get; init; }
}
