using System.Text.Json.Serialization;
using SeedApi.Core;

#nullable enable

namespace SeedApi;

public record A
{
    [JsonPropertyName("s")]
    public required string S { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
