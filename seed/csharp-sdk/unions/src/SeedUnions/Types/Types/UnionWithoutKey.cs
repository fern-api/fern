using SeedUnions;
using System.Text.Json.Serialization;

namespace SeedUnions;

public class UnionWithoutKey
{
    public class _Foo : Foo
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "foo";
    }
    public class _Bar : Bar
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "bar";
    }
}
