using SeedUnionsClient
using System.Text.Json.Serialization

namespace SeedUnionsClient

public class UnionWithBaseProperties
{
    public class _Value : IBase
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "integer";

        [JsonPropertyName("value")]
        public int Value { get; init; }
    }
    public class _Value : IBase
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "string";

        [JsonPropertyName("value")]
        public string Value { get; init; }
    }
    public class _Foo : Foo, IBase
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "foo";
    }
    namespace SeedUnionsClient

    private interface IBase
    {
        [JsonPropertyName("id")]
        public string Id { get; init; }
    }
}
