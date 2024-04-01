using Client;
using System.Text.Json.Serialization;

namespace Client;

public class CreateProblemError
{
    public class _Generic : GenericCreateProblemError
    {
        [JsonPropertyName("_type")]
        public string ErrorType { get; } = "generic";
    }
}
