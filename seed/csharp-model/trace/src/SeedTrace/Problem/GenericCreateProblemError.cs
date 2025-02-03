using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record GenericCreateProblemError
{
    [JsonPropertyName("message")]
    public required string Message { get; set; }

    [JsonPropertyName("type")]
    public required string Type { get; set; }

    [JsonPropertyName("stacktrace")]
    public required string Stacktrace { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
