using System;
using System.Text.Json.Serialization;
using SeedTrace.Core;

#nullable enable

namespace SeedTrace;

[JsonConverter(typeof(StringEnumSerializer<MigrationStatus>))]
public readonly struct MigrationStatus : IStringEnum, IEquatable<MigrationStatus>
{
    public MigrationStatus(string value)
    {
        Value = value;
    }

    /// <summary>
    /// The string value of the enum.
    /// </summary>
    public string Value { get; }

    /// <summary>
    /// The migration is running
    /// </summary>
    public static readonly MigrationStatus Running = Custom(Values.Running);

    /// <summary>
    /// The migration is failed
    /// </summary>
    public static readonly MigrationStatus Failed = Custom(Values.Failed);

    public static readonly MigrationStatus Finished = Custom(Values.Finished);

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    public static class Values
    {
        /// <summary>
        /// The migration is running
        /// </summary>
        public const string Running = "RUNNING";

        /// <summary>
        /// The migration is failed
        /// </summary>
        public const string Failed = "FAILED";

        public const string Finished = "FINISHED";
    }

    /// <summary>
    /// Create a string enum with the given value.
    /// </summary>
    public static MigrationStatus Custom(string value)
    {
        return new MigrationStatus(value);
    }

    /// <summary>
    /// Returns the string value of the enum.
    /// </summary>
    public override string ToString()
    {
        return Value;
    }

    public bool Equals(MigrationStatus other)
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
        return Equals((MigrationStatus)obj);
    }

    public override int GetHashCode()
    {
        return Value.GetHashCode();
    }

    public static bool operator ==(MigrationStatus value1, MigrationStatus value2) =>
        value1.Equals(value2);

    public static bool operator !=(MigrationStatus value1, MigrationStatus value2) =>
        !(value1 == value2);

    public static bool operator ==(MigrationStatus value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(MigrationStatus value1, string value2) =>
        !value1.Value.Equals(value2);
}
