using System.Text.Json.Serialization;
using SeedUnionsClient;

namespace SeedUnionsClient;

public class Union
{
    public class _Foo
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "foo";

        [JsonPropertyName("foo")]
        public Foo Foo { get; init; }
    }
    public class _Bar
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "bar";

        [JsonPropertyName("bar")]
        public Bar Bar { get; init; }
    }
}
