using SeedTraceClient.V2.V3
using System.Text.Json.Serialization

namespace SeedTraceClient.V2.V3

public class TestCaseImplementationReference
{
    namespace SeedTraceClient.V2.V3

    public class Value
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "templateId"
        ;
        
        [JsonPropertyName("value")]
        public string Value { get; init; }
    }
    
    namespace SeedTraceClient.V2.V3

    private interface IBase
    {
    }
    
}
