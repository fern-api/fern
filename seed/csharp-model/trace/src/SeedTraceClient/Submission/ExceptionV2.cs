using SeedTraceClient;
using System.Text.Json.Serialization;

namespace SeedTraceClient;

public class ExceptionV2
{
    public class _Generic : ExceptionInfo
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "generic";
    }
    public class _Timeout
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "timeout";
    }
}
