using System.Text.Json.Serialization;

namespace SeedExamplesClient;

public class Response
{
    [JsonPropertyName("response")]
    public object Response { get; init; }
}
