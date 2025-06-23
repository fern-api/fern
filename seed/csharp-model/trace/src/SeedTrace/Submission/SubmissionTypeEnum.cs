using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(StringEnumSerializer<SubmissionTypeEnum>))]
[Serializable]
public readonly record struct SubmissionTypeEnum : IStringEnum
{
    public static readonly SubmissionTypeEnum Test = new(Values.Test);

    public SubmissionTypeEnum(string value)
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
    public static SubmissionTypeEnum FromCustom(string value)
    {
        return new SubmissionTypeEnum(value);
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

    public static bool operator ==(SubmissionTypeEnum value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(SubmissionTypeEnum value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(SubmissionTypeEnum value) => value.Value;

    public static explicit operator SubmissionTypeEnum(string value) => new(value);

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    [Serializable]
    public static class Values
    {
        public const string Test = "TEST";
    }
}
