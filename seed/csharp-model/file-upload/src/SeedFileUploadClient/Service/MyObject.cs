using System.Text.Json.Serialization;

namespace SeedFileUploadClient;

public class MyObject
{
    [JsonPropertyName("foo")]
    public string Foo { get; init; }
}
