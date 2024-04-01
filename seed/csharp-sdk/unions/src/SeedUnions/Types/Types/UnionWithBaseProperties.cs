using SeedUnions;
using System.Text.Json.Serialization;

namespace SeedUnions;

public class UnionWithBaseProperties
{
    public class _Integer : _IBase
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "integer";

        [JsonPropertyName("value")]
        public int Value { get; init; }
    }
    public class _String : _IBase
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "string";

        [JsonPropertyName("value")]
        public string Value { get; init; }
    }
    public class _Foo : Foo, _IBase
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "foo";
    }
    namespace SeedUnions;

    private interface _IBase
    {
        [JsonPropertyName("id")]
        public string Id { get; init; }
    }
}
