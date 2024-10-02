using System;
using System.Text.Json.Serialization;
using SeedFileUpload.Core;

#nullable enable

namespace SeedFileUpload;

[JsonConverter(typeof(StringEnumSerializer<ObjectType>))]
public readonly struct ObjectType : IStringEnum, IEquatable<ObjectType>
{
    public ObjectType(string value)
    {
        Value = value;
    }

    /// <summary>
    /// The string value of the enum.
    /// </summary>
    public string Value { get; }

    public static readonly ObjectType Foo = Custom(Values.Foo);

    public static readonly ObjectType Bar = Custom(Values.Bar);

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    public static class Values
    {
        public const string Foo = "FOO";

        public const string Bar = "BAR";
    }

    /// <summary>
    /// Create a string enum with the given value.
    /// </summary>
    public static ObjectType Custom(string value)
    {
        return new ObjectType(value);
    }

    /// <summary>
    /// Returns the string value of the enum.
    /// </summary>
    public override string ToString()
    {
        return Value;
    }

    public bool Equals(ObjectType other)
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
        return Equals((ObjectType)obj);
    }

    public override int GetHashCode()
    {
        return Value.GetHashCode();
    }

    public static bool operator ==(ObjectType value1, ObjectType value2) => value1.Equals(value2);

    public static bool operator !=(ObjectType value1, ObjectType value2) => !(value1 == value2);

    public static bool operator ==(ObjectType value1, string value2) => value1.Value.Equals(value2);

    public static bool operator !=(ObjectType value1, string value2) =>
        !value1.Value.Equals(value2);
}
