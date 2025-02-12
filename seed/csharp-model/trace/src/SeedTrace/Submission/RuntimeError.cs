using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record RuntimeError
{
    [JsonPropertyName("message")]
    public required string Message { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
