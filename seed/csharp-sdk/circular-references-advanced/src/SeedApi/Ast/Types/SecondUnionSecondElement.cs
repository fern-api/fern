using System.Text.Json.Serialization;
using OneOf;
using SeedApi.Core;

namespace SeedApi;

public record SecondUnionSecondElement
{
    [JsonPropertyName("child")]
    public required OneOf<FirstUnionFirstElement, FirstUnionSecondElement> Child { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
