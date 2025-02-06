using System.Text.Json.Serialization;
using SeedUnknownAsAny.Core;

namespace SeedUnknownAsAny;

public record MyObject
{
    [JsonPropertyName("unknown")]
    public required object Unknown { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
