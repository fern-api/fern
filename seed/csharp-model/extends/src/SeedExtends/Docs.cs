using System.Text.Json.Serialization;
using SeedExtends.Core;

namespace SeedExtends;

public record Docs
{
    [JsonPropertyName("docs")]
    public required string Docs_ { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
