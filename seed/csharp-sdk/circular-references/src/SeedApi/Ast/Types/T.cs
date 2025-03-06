using System.Text.Json.Serialization;
using OneOf;
using SeedApi.Core;

namespace SeedApi;

public record T
{
    [JsonPropertyName("child")]
    public required OneOf<T, U> Child { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
