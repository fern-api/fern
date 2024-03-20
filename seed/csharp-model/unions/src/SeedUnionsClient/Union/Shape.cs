using SeedUnionsClient
using System.Text.Json.Serialization

namespace SeedUnionsClient

public class Shape
{
    public class _Circle : Circle, IBase
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "circle";
    }
    public class _Square : Square, IBase
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "square";
    }
    namespace SeedUnionsClient

    private interface IBase
    {
        [JsonPropertyName("id")]
        public string Id { get; init; }
    }
}
