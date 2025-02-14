using System.Text.Json.Serialization;
using SeedExtraProperties.Core;

namespace SeedExtraProperties;

public record Failure
{
    [JsonPropertyName("status")]
    public string Status { get; set; } = "failure";

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
