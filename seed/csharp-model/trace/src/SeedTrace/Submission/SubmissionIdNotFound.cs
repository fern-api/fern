using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record SubmissionIdNotFound
{
    [JsonPropertyName("missingSubmissionId")]
    public required string MissingSubmissionId { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
