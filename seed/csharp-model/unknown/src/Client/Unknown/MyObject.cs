using System.Text.Json.Serialization;

namespace Client;

public class MyObject
{
    [JsonPropertyName("unknown")]
    public object Unknown { get; init; }
}
