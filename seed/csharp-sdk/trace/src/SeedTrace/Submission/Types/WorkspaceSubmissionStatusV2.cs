using System.Text.Json;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record WorkspaceSubmissionStatusV2
{
    [JsonPropertyName("updates")]
    public IEnumerable<WorkspaceSubmissionUpdate> Updates { get; set; } =
        new List<WorkspaceSubmissionUpdate>();

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } =
        new Dictionary<string, JsonElement>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
