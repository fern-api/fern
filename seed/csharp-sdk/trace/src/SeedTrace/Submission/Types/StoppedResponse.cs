using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record StoppedResponse
{
    [JsonPropertyName("submissionId")]
    public required string SubmissionId { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
