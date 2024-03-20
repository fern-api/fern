using System.Text.Json.Serialization;

namespace SeedUnknownAsAnyClient;

public class MyObject
{
    [JsonPropertyName("unknown")]
    public object Unknown { get; init; }
}
