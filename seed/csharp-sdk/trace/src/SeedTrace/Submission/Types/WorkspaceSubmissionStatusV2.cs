using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record WorkspaceSubmissionStatusV2
{
    [JsonPropertyName("updates")]
    public IEnumerable<WorkspaceSubmissionUpdate> Updates { get; set; } =
        new List<WorkspaceSubmissionUpdate>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
