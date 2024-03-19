using SeedTraceClient
using System.Text.Json.Serialization

namespace SeedTraceClient

public class PlaylistIdNotFoundErrorBody
{
    namespace SeedTraceClient

    public class Value
     : IBase{
        [JsonPropertyName("type")]
        public string Type { get; } = "playlistId"
        ;
        
        [JsonPropertyName("value")]
        public string Value { get; init; }
    }
    
    namespace SeedTraceClient

    private interface IBase
    {
    }
    
}
