using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(StringEnumSerializer<MigrationStatus>))]
[Serializable]
public readonly record struct MigrationStatus : IStringEnum
{
    /// <summary>
    /// The migration is running
    /// </summary>
    public static readonly MigrationStatus Running = new(Values.Running);

    /// <summary>
    /// The migration is failed
    /// </summary>
    public static readonly MigrationStatus Failed = new(Values.Failed);

    public static readonly MigrationStatus Finished = new(Values.Finished);

    public MigrationStatus(string value)
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
    public static MigrationStatus FromCustom(string value)
    {
        return new MigrationStatus(value);
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

    public static bool operator ==(MigrationStatus value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(MigrationStatus value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(MigrationStatus value) => value.Value;

    public static explicit operator MigrationStatus(string value) => new(value);

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    [Serializable]
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
}
