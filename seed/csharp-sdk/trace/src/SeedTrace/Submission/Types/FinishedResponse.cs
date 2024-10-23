using System.Text.Json.Serialization;
using SeedTrace.Core;

#nullable enable

namespace SeedTrace;

public record FinishedResponse
{
    [JsonPropertyName("submissionId")]
    public required string SubmissionId { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
