using System.Text.Json.Serialization;
using SeedTrace.Core;

#nullable enable

namespace SeedTrace;

public record LangServerRequest
{
    [JsonPropertyName("request")]
    public required object Request { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
