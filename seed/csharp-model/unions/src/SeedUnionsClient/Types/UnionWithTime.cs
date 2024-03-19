using SeedUnionsClient
using System.Text.Json.Serialization

namespace SeedUnionsClient

public class UnionWithTime
{
    namespace SeedUnionsClient

    public class Value
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "value"
        ;
        
        [JsonPropertyName("value")]
        public int Value { get; init; }
    }
    
    namespace SeedUnionsClient

    public class Value
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "date"
        ;
        
        [JsonPropertyName("value")]
        public DateOnly Value { get; init; }
    }
    
    namespace SeedUnionsClient

    public class Value
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "datetime"
        ;
        
        [JsonPropertyName("value")]
        public DateTime Value { get; init; }
    }
    
    namespace SeedUnionsClient

    private interface IBase
    {
    }
    
}
