using System.Text.Json.Serialization;

namespace SeedFileUpload;

public class MyObject
{
    [JsonPropertyName("foo")]
    public string Foo { get; init; }
}
