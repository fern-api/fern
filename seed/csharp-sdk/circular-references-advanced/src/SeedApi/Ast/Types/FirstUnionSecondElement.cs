using System.Text.Json.Serialization;
using OneOf;
using SeedApi.Core;

namespace SeedApi;

public record FirstUnionSecondElement
{
    [JsonPropertyName("child")]
    public required OneOf<SecondUnionFirstElement, SecondUnionSecondElement> Child { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
