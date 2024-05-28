using System.Text.Json.Serialization;

#nullable enable

namespace SeedUnknownAsAny;

public class MyObject
{
    [JsonPropertyName("unknown")]
    public object Unknown { get; init; }
}
