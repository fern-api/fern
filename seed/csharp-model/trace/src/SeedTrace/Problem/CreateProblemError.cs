using SeedTrace;
using System.Text.Json.Serialization;

namespace SeedTrace;

public class CreateProblemError
{
    public class _Generic : GenericCreateProblemError
    {
        [JsonPropertyName("_type")]
        public string ErrorType { get; } = "generic";
    }
}
