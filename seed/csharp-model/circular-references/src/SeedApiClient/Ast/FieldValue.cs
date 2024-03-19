using SeedApiClient
using System.Text.Json.Serialization
using StringEnum
using OneOf

namespace SeedApiClient

public class FieldValue
{
    namespace SeedApiClient

    public class Value
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "primitive_value"
        ;
        
        [JsonPropertyName("value")]
        public StringEnum<PrimitiveValue> Value { get; init; }
    }
    
    namespace SeedApiClient

    public class Value
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "container_value"
        ;
        
        [JsonPropertyName("value")]
        public OneOf<Value,Value> Value { get; init; }
    }
    
    namespace SeedApiClient

    private interface IBase
    {
    }
    
}
