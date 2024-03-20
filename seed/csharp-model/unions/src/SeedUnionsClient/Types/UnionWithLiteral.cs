using SeedUnionsClient;
using System.Text.Json.Serialization;

namespace SeedUnionsClient;

public class UnionWithLiteral
{
    public class _Fern : _IBase
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "fern";

        [JsonPropertyName("value")]
        public string Value { get; init; }
    }
    namespace SeedUnionsClient;

    private interface _IBase
    {
        [JsonPropertyName("base")]
        public string Base { get; init; }
    }
}
