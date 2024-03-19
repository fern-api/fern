using SeedTraceClient.V2.V3
using System.Text.Json.Serialization
using StringEnum
using SeedTraceClient

namespace SeedTraceClient.V2.V3

public class CustomFiles
{
    namespace SeedTraceClient.V2.V3

    public class Value
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "custom"
        ;
        
        [JsonPropertyName("value")]
        public Dictionary<StringEnum<Language>,Files> Value { get; init; }
    }
    
    namespace SeedTraceClient.V2.V3

    private interface IBase
    {
    }
    
}
