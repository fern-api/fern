using System.Text.Json.Serialization;

namespace SeedExamples;

public class Request
{
    [JsonPropertyName("request")]
    public object Request { get; init; }
}
