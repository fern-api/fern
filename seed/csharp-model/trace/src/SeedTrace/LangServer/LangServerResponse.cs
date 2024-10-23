using System.Text.Json.Serialization;
using SeedTrace.Core;

#nullable enable

namespace SeedTrace;

public record LangServerResponse
{
    [JsonPropertyName("response")]
    public required object Response { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
