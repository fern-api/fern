using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record WorkspaceSubmissionState
{
    [JsonPropertyName("status")]
    public required object Status { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
