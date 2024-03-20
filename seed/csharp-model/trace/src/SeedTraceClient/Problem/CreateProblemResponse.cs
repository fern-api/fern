using System.Text.Json.Serialization
using OneOf
using SeedTraceClient

namespace SeedTraceClient

public class CreateProblemResponse
{
    public class _Value
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "success";

        [JsonPropertyName("value")]
        public string Value { get; init; }
    }
    public class _Value
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "error";

        [JsonPropertyName("value")]
        public OneOf<GenericCreateProblemError> Value { get; init; }
    }
}
