using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record InvalidRequestResponse
{
    [JsonPropertyName("request")]
    public required object Request { get; set; }

    [JsonPropertyName("cause")]
    public required object Cause { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
