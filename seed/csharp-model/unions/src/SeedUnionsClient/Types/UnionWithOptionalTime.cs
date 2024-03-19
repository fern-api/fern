using SeedUnionsClient
using System.Text.Json.Serialization

namespace SeedUnionsClient

public class UnionWithOptionalTime
{
    namespace SeedUnionsClient

    public class Value
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "date"
        ;
        
        [JsonPropertyName("value")]
        public DateOnly? Value { get; init; }
    }
    
    namespace SeedUnionsClient

    public class Value
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "dateimte"
        ;
        
        [JsonPropertyName("value")]
        public DateTime? Value { get; init; }
    }
    
    namespace SeedUnionsClient

    private interface IBase
    {
    }
    
}
