using SeedExhaustiveClient.Types;
using System.Text.Json.Serialization;

namespace SeedExhaustiveClient.Types;

public class Animal
{
    public class _Dog : Dog
    {
        [JsonPropertyName("animal")]
        public string Animal { get; } = "dog";
    }
    public class _Cat : Cat
    {
        [JsonPropertyName("animal")]
        public string Animal { get; } = "cat";
    }
}
