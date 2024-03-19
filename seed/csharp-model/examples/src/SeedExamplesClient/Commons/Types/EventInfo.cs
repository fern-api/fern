using SeedExamplesClient.Commons
using System.Text.Json.Serialization

namespace SeedExamplesClient.Commons

public class EventInfo
{
    namespace SeedExamplesClient.Commons

    public class Value
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "tag"
        ;
        
        [JsonPropertyName("value")]
        public string Value { get; init; }
    }
    
    namespace SeedExamplesClient.Commons

    private interface IBase
    {
    }
    
}
