using System.Text.Json.Serialization;
using OneOf;
using SeedExamples.Core;

#nullable enable

namespace SeedExamples;

public record ResponseType
{
    [JsonPropertyName("type")]
    [JsonConverter(typeof(OneOfSerializer<OneOf<BasicType, ComplexType>>))]
    public required OneOf<BasicType, ComplexType> Type { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
