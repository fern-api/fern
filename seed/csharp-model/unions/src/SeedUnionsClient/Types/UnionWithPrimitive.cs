using SeedUnionsClient
using System.Text.Json.Serialization

namespace SeedUnionsClient

public class UnionWithPrimitive
{
    namespace SeedUnionsClient

    public class Value
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "integer"
        ;
        
        [JsonPropertyName("value")]
        public int Value { get; init; }
    }
    
    namespace SeedUnionsClient

    public class Value
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "string"
        ;
        
        [JsonPropertyName("value")]
        public string Value { get; init; }
    }
    
    namespace SeedUnionsClient

    private interface IBase
    {
    }
    
}
