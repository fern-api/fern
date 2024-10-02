using System;
using System.Text.Json.Serialization;
using SeedTrace.Core;

#nullable enable

namespace SeedTrace;

[JsonConverter(typeof(StringEnumSerializer<Language>))]
public readonly struct Language : IStringEnum, IEquatable<Language>
{
    public Language(string value)
    {
        Value = value;
    }

    /// <summary>
    /// The string value of the enum.
    /// </summary>
    public string Value { get; }

    public static readonly Language Java = Custom(Values.Java);

    public static readonly Language Javascript = Custom(Values.Javascript);

    public static readonly Language Python = Custom(Values.Python);

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    public static class Values
    {
        public const string Java = "JAVA";

        public const string Javascript = "JAVASCRIPT";

        public const string Python = "PYTHON";
    }

    /// <summary>
    /// Create a string enum with the given value.
    /// </summary>
    public static Language Custom(string value)
    {
        return new Language(value);
    }

    /// <summary>
    /// Returns the string value of the enum.
    /// </summary>
    public override string ToString()
    {
        return Value;
    }

    public bool Equals(Language other)
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
        return Equals((Language)obj);
    }

    public override int GetHashCode()
    {
        return Value.GetHashCode();
    }

    public static bool operator ==(Language value1, Language value2) => value1.Equals(value2);

    public static bool operator !=(Language value1, Language value2) => !(value1 == value2);

    public static bool operator ==(Language value1, string value2) => value1.Value.Equals(value2);

    public static bool operator !=(Language value1, string value2) => !value1.Value.Equals(value2);
}
