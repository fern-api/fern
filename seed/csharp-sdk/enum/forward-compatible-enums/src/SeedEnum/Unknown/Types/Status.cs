using System.Text.Json.Serialization;
using SeedEnum.Core;

namespace SeedEnum;

[JsonConverter(typeof(StringEnumSerializer<Status>))]
public readonly record struct Status : IStringEnum
{
    public static readonly Status Known = Custom(Values.Known);

    public static readonly Status Unknown = Custom(Values.Unknown);

    public Status(string value)
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
    public static Status Custom(string value)
    {
        return new Status(value);
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

    public static bool operator ==(Status value1, string value2) => value1.Value.Equals(value2);

    public static bool operator !=(Status value1, string value2) => !value1.Value.Equals(value2);

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    public static class Values
    {
        public const string Known = "Known";

        public const string Unknown = "Unknown";
    }
}
