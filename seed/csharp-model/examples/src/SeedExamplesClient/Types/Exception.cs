using SeedExamplesClient
using System.Text.Json.Serialization

namespace SeedExamplesClient

public class Exception
{
    namespace SeedExamplesClient

    public class Timeout
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "timeout"
        ;
        
    }
    
    namespace SeedExamplesClient

    private interface IBase
    {
    }
    
}
