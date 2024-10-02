using System;
using System.Text.Json.Serialization;
using SeedTrace.Core;

#nullable enable

namespace SeedTrace;

[JsonConverter(typeof(StringEnumSerializer<SubmissionTypeEnum>))]
public readonly struct SubmissionTypeEnum : IStringEnum, IEquatable<SubmissionTypeEnum>
{
    public SubmissionTypeEnum(string value)
    {
        Value = value;
    }

    /// <summary>
    /// The string value of the enum.
    /// </summary>
    public string Value { get; }

    public static readonly SubmissionTypeEnum Test = Custom(Values.Test);

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    public static class Values
    {
        public const string Test = "TEST";
    }

    /// <summary>
    /// Create a string enum with the given value.
    /// </summary>
    public static SubmissionTypeEnum Custom(string value)
    {
        return new SubmissionTypeEnum(value);
    }

    /// <summary>
    /// Returns the string value of the enum.
    /// </summary>
    public override string ToString()
    {
        return Value;
    }

    public bool Equals(SubmissionTypeEnum other)
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
        return Equals((SubmissionTypeEnum)obj);
    }

    public override int GetHashCode()
    {
        return Value.GetHashCode();
    }

    public static bool operator ==(SubmissionTypeEnum value1, SubmissionTypeEnum value2) =>
        value1.Equals(value2);

    public static bool operator !=(SubmissionTypeEnum value1, SubmissionTypeEnum value2) =>
        !(value1 == value2);

    public static bool operator ==(SubmissionTypeEnum value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(SubmissionTypeEnum value1, string value2) =>
        !value1.Value.Equals(value2);
}
