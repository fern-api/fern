using SeedApiClient
using System.Text.Json.Serialization
using OneOf

namespace SeedApiClient

public class ContainerValue
{
    namespace SeedApiClient

    public class Value
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "list"
        ;
        
        [JsonPropertyName("value")]
        public List<OneOf<Value,ObjectValue,Value>> Value { get; init; }
    }
    
    namespace SeedApiClient

    public class Value
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "optional"
        ;
        
        [JsonPropertyName("value")]
        public OneOf<Value,ObjectValue,Value>? Value { get; init; }
    }
    
    namespace SeedApiClient

    private interface IBase
    {
    }
    
}
