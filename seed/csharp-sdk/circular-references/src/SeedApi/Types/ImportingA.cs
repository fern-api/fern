using System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

public record ImportingA
{
    [JsonPropertyName("a")]
    public A? A { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
