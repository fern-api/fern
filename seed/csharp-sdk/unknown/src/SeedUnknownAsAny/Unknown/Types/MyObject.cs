using System.Text.Json.Serialization;

#nullable enable

namespace SeedUnknownAsAny;

public record MyObject
{
    [JsonPropertyName("unknown")]
    public required object Unknown { get; set; }
}
