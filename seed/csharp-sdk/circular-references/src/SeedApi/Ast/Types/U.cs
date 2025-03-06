using System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

public record U
{
    [JsonPropertyName("child")]
    public required T Child { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
