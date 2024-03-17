using System.Text.Json.Serialization

namespace test

public class BadObjectRequestInfo
{
    [JsonPropertyName("message")]
    public string Message { get; init; }
}
