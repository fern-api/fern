using System.Text.Json.Serialization;

namespace SeedUnknownAsAny;

public class MyObject
{
    [JsonPropertyName("unknown")]
    public object Unknown { get; init; }
}
