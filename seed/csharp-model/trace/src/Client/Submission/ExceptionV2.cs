using Client;
using System.Text.Json.Serialization;

namespace Client;

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
