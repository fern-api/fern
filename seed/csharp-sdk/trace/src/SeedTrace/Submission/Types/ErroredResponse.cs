using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record ErroredResponse
{
    [JsonPropertyName("submissionId")]
    public required string SubmissionId { get; set; }

    [JsonPropertyName("errorInfo")]
    public required object ErrorInfo { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
