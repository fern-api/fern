using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(StringEnumSerializer<Language>))]
[Serializable]
public readonly record struct Language : IStringEnum
{
    public static readonly Language Java = new(Values.Java);

    public static readonly Language Javascript = new(Values.Javascript);

    public static readonly Language Python = new(Values.Python);

    public Language(string value)
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
    public static Language FromCustom(string value)
    {
        return new Language(value);
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

    public static bool operator ==(Language value1, string value2) => value1.Value.Equals(value2);

    public static bool operator !=(Language value1, string value2) => !value1.Value.Equals(value2);

    public static explicit operator string(Language value) => value.Value;

    public static explicit operator Language(string value) => new(value);

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    [Serializable]
    public static class Values
    {
        public const string Java = "JAVA";

        public const string Javascript = "JAVASCRIPT";

        public const string Python = "PYTHON";
    }
}
