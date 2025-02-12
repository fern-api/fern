using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace.V2;

public record FunctionImplementation
{
    [JsonPropertyName("impl")]
    public required string Impl { get; set; }

    [JsonPropertyName("imports")]
    public string? Imports { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
