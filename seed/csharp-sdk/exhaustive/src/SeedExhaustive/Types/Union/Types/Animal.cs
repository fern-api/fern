using SeedExhaustive.Types;
using System.Text.Json.Serialization;

namespace SeedExhaustive.Types;

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
