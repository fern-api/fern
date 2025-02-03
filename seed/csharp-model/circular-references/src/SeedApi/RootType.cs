using System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

public record RootType
{
    [JsonPropertyName("s")]
    public required string S { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
