using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record StdoutResponse
{
    [JsonPropertyName("submissionId")]
    public required string SubmissionId { get; set; }

    [JsonPropertyName("stdout")]
    public required string Stdout { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
