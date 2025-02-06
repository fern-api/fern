using System.Text.Json.Serialization;
using SeedExamples.Core;

namespace SeedExamples;

public record Request
{
    [JsonPropertyName("request")]
    public required object Request_ { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
