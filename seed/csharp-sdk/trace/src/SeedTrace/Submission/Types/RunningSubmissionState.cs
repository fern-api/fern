using System;
using System.Text.Json.Serialization;
using SeedTrace.Core;

#nullable enable

namespace SeedTrace;

[JsonConverter(typeof(StringEnumSerializer<RunningSubmissionState>))]
public readonly struct RunningSubmissionState : IStringEnum, IEquatable<RunningSubmissionState>
{
    public RunningSubmissionState(string value)
    {
        Value = value;
    }

    /// <summary>
    /// The string value of the enum.
    /// </summary>
    public string Value { get; }

    public static readonly RunningSubmissionState QueueingSubmission = Custom(
        Values.QueueingSubmission
    );

    public static readonly RunningSubmissionState KillingHistoricalSubmissions = Custom(
        Values.KillingHistoricalSubmissions
    );

    public static readonly RunningSubmissionState WritingSubmissionToFile = Custom(
        Values.WritingSubmissionToFile
    );

    public static readonly RunningSubmissionState CompilingSubmission = Custom(
        Values.CompilingSubmission
    );

    public static readonly RunningSubmissionState RunningSubmission = Custom(
        Values.RunningSubmission
    );

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    public static class Values
    {
        public const string QueueingSubmission = "QUEUEING_SUBMISSION";

        public const string KillingHistoricalSubmissions = "KILLING_HISTORICAL_SUBMISSIONS";

        public const string WritingSubmissionToFile = "WRITING_SUBMISSION_TO_FILE";

        public const string CompilingSubmission = "COMPILING_SUBMISSION";

        public const string RunningSubmission = "RUNNING_SUBMISSION";
    }

    /// <summary>
    /// Create a string enum with the given value.
    /// </summary>
    public static RunningSubmissionState Custom(string value)
    {
        return new RunningSubmissionState(value);
    }

    /// <summary>
    /// Returns the string value of the enum.
    /// </summary>
    public override string ToString()
    {
        return Value;
    }

    public bool Equals(RunningSubmissionState other)
    {
        return Value == other.Value;
    }

    public bool Equals(string? other)
    {
        return Value.Equals(other);
    }

    public override bool Equals(object? obj)
    {
        if (obj is null)
            return false;
        if (obj is string stringObj)
            return Value.Equals(stringObj);
        if (obj.GetType() != GetType())
            return false;
        return Equals((RunningSubmissionState)obj);
    }

    public override int GetHashCode()
    {
        return Value.GetHashCode();
    }

    public static bool operator ==(RunningSubmissionState value1, RunningSubmissionState value2) =>
        value1.Equals(value2);

    public static bool operator !=(RunningSubmissionState value1, RunningSubmissionState value2) =>
        !(value1 == value2);

    public static bool operator ==(RunningSubmissionState value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(RunningSubmissionState value1, string value2) =>
        !value1.Value.Equals(value2);
}
