using SeedTraceClient
using System.Text.Json.Serialization

namespace SeedTraceClient

public class Test
{
    namespace SeedTraceClient

    public class Value
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "and"
        ;
        
        [JsonPropertyName("value")]
        public bool Value { get; init; }
    }
    
    namespace SeedTraceClient

    public class Value
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "or"
        ;
        
        [JsonPropertyName("value")]
        public bool Value { get; init; }
    }
    
    namespace SeedTraceClient

    private interface IBase
    {
    }
    
}
