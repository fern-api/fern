using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record WorkspaceSubmissionUpdate
{
    [JsonPropertyName("updateTime")]
    public required DateTime UpdateTime { get; set; }

    [JsonPropertyName("updateInfo")]
    public required object UpdateInfo { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
