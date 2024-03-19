using SeedExamplesClient
using System.Text.Json.Serialization

namespace SeedExamplesClient

public class Test
{
    namespace SeedExamplesClient

    public class Value
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "and"
        ;
        
        [JsonPropertyName("value")]
        public bool Value { get; init; }
    }
    
    namespace SeedExamplesClient

    public class Value
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "or"
        ;
        
        [JsonPropertyName("value")]
        public bool Value { get; init; }
    }
    
    namespace SeedExamplesClient

    private interface IBase
    {
    }
    
}
