using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record TestSubmissionUpdate
{
    [JsonPropertyName("updateTime")]
    public required DateTime UpdateTime { get; }

    [JsonPropertyName("updateInfo")]
    public required object UpdateInfo { get; }
}
