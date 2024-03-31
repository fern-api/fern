using Client;
using System.Text.Json.Serialization;

namespace Client;

public class InvalidRequestCause
{
    public class _SubmissionIdNotFound : SubmissionIdNotFound
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "submissionIdNotFound";
    }
    public class _CustomTestCasesUnsupported : CustomTestCasesUnsupported
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "customTestCasesUnsupported";
    }
    public class _UnexpectedLanguage : UnexpectedLanguageError
    {
        [JsonPropertyName("type")]
        public string Type { get; } = "unexpectedLanguage";
    }
}
