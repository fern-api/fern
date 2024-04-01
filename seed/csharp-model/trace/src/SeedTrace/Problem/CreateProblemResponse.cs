using System.Text.Json.Serialization;
using OneOf;
using SeedTrace;

namespace SeedTrace;

public class CreateProblemResponse
{
    public class _Success
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "success";

        [JsonPropertyName("value")]
        public string Value { get; init; }
    }
    public class _Error
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "error";

        [JsonPropertyName("value")]
        public OneOf<CreateProblemError._Generic> Value { get; init; }
    }
}
