using SeedUnionsClient
using System.Text.Json.Serialization

namespace SeedUnionsClient

public class UnionWithLiteral
{
    public class _Value : IBase
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "fern";

        [JsonPropertyName("value")]
        public string Value { get; init; }
    }
    namespace SeedUnionsClient

    private interface IBase
    {
        [JsonPropertyName("base")]
        public string Base { get; init; }
    }
}
