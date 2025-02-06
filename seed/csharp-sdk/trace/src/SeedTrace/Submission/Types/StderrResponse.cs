using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record StderrResponse
{
    [JsonPropertyName("submissionId")]
    public required string SubmissionId { get; set; }

    [JsonPropertyName("stderr")]
    public required string Stderr { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
