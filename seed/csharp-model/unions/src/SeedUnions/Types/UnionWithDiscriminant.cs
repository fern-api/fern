using System.Text.Json.Serialization;
using SeedUnions;

namespace SeedUnions;

public class UnionWithDiscriminant
{
    public class _Foo
    {
        [JsonPropertyName("_type")]
        public string Type { get; } = "foo";

        [JsonPropertyName("foo")]
        public Foo Foo { get; init; }
    }
    public class _Bar
    {
        [JsonPropertyName("_type")]
        public string Type { get; } = "bar";

        [JsonPropertyName("bar")]
        public Bar Bar { get; init; }
    }
}
