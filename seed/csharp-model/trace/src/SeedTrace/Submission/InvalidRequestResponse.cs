using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class InvalidRequestResponse
{
    [JsonPropertyName("request")]
    public SubmissionRequest Request { get; init; }

    [JsonPropertyName("cause")]
    public InvalidRequestCause Cause { get; init; }
}
