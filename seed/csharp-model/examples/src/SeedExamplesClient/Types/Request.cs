using System.Text.Json.Serialization

namespace SeedExamplesClient

public class Request
{
    [JsonPropertyName("request")]
    public object Request { get; init; }
}
