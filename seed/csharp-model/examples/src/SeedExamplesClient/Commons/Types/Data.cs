using SeedExamplesClient.Commons
using System.Text.Json.Serialization

namespace SeedExamplesClient.Commons

public class Data
{
    namespace SeedExamplesClient.Commons

    public class Value
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "string"
        ;
        
        [JsonPropertyName("value")]
        public string Value { get; init; }
    }
    
    namespace SeedExamplesClient.Commons

    public class Value
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "base64"
        ;
        
        [JsonPropertyName("value")]
        public string Value { get; init; }
    }
    
    namespace SeedExamplesClient.Commons

    private interface IBase
    {
    }
    
}
