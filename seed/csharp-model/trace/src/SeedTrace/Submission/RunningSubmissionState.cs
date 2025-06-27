using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(StringEnumSerializer<RunningSubmissionState>))]
[Serializable]
public readonly record struct RunningSubmissionState : IStringEnum
{
    public static readonly RunningSubmissionState QueueingSubmission = new(
        Values.QueueingSubmission
    );

    public static readonly RunningSubmissionState KillingHistoricalSubmissions = new(
        Values.KillingHistoricalSubmissions
    );

    public static readonly RunningSubmissionState WritingSubmissionToFile = new(
        Values.WritingSubmissionToFile
    );

    public static readonly RunningSubmissionState CompilingSubmission = new(
        Values.CompilingSubmission
    );

    public static readonly RunningSubmissionState RunningSubmission = new(Values.RunningSubmission);

    public RunningSubmissionState(string value)
    {
        Value = value;
    }

    /// <summary>
    /// The string value of the enum.
    /// </summary>
    public string Value { get; }

    /// <summary>
    /// Create a string enum with the given value.
    /// </summary>
    public static RunningSubmissionState FromCustom(string value)
    {
        return new RunningSubmissionState(value);
    }

    public bool Equals(string? other)
    {
        return Value.Equals(other);
    }

    /// <summary>
    /// Returns the string value of the enum.
    /// </summary>
    public override string ToString()
    {
        return Value;
    }

    public static bool operator ==(RunningSubmissionState value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(RunningSubmissionState value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(RunningSubmissionState value) => value.Value;

    public static explicit operator RunningSubmissionState(string value) => new(value);

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    [Serializable]
    public static class Values
    {
        public const string QueueingSubmission = "QUEUEING_SUBMISSION";

        public const string KillingHistoricalSubmissions = "KILLING_HISTORICAL_SUBMISSIONS";

        public const string WritingSubmissionToFile = "WRITING_SUBMISSION_TO_FILE";

        public const string CompilingSubmission = "COMPILING_SUBMISSION";

        public const string RunningSubmission = "RUNNING_SUBMISSION";
    }
}
