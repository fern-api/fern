using System.Text.Json;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record GetSubmissionStateResponse
{
    [JsonPropertyName("timeSubmitted")]
    public DateTime? TimeSubmitted { get; set; }

    [JsonPropertyName("submission")]
    public required string Submission { get; set; }

    [JsonPropertyName("language")]
    public required Language Language { get; set; }

    [JsonPropertyName("submissionTypeState")]
    public required object SubmissionTypeState { get; set; }

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    /// <remarks>
    /// [EXPERIMENTAL] This API is experimental and may change in future releases.
    /// </remarks>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } =
        new Dictionary<string, JsonElement>();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
