using System.Text.Json;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record WorkspaceSubmitRequest
{
    [JsonPropertyName("submissionId")]
    public required string SubmissionId { get; set; }

    [JsonPropertyName("language")]
    public required Language Language { get; set; }

    [JsonPropertyName("submissionFiles")]
    public IEnumerable<SubmissionFileInfo> SubmissionFiles { get; set; } =
        new List<SubmissionFileInfo>();

    [JsonPropertyName("userId")]
    public string? UserId { get; set; }

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } =
        new Dictionary<string, JsonElement>();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
