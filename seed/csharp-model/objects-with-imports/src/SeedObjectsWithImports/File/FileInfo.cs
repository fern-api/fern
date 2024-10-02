using System;
using System.Text.Json.Serialization;
using SeedObjectsWithImports.Core;

#nullable enable

namespace SeedObjectsWithImports;

[JsonConverter(typeof(StringEnumSerializer<FileInfo>))]
public readonly struct FileInfo : IStringEnum, IEquatable<FileInfo>
{
    public FileInfo(string value)
    {
        Value = value;
    }

    /// <summary>
    /// The string value of the enum.
    /// </summary>
    public string Value { get; }

    /// <summary>
    /// A regular file (e.g. foo.txt).
    /// </summary>
    public static readonly FileInfo Regular = Custom(Values.Regular);

    /// <summary>
    /// A directory (e.g. foo/).
    /// </summary>
    public static readonly FileInfo Directory = Custom(Values.Directory);

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    public static class Values
    {
        /// <summary>
        /// A regular file (e.g. foo.txt).
        /// </summary>
        public const string Regular = "REGULAR";

        /// <summary>
        /// A directory (e.g. foo/).
        /// </summary>
        public const string Directory = "DIRECTORY";
    }

    /// <summary>
    /// Create a string enum with the given value.
    /// </summary>
    public static FileInfo Custom(string value)
    {
        return new FileInfo(value);
    }

    /// <summary>
    /// Returns the string value of the enum.
    /// </summary>
    public override string ToString()
    {
        return Value;
    }

    public bool Equals(FileInfo other)
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
        return Equals((FileInfo)obj);
    }

    public override int GetHashCode()
    {
        return Value.GetHashCode();
    }

    public static bool operator ==(FileInfo value1, FileInfo value2) => value1.Equals(value2);

    public static bool operator !=(FileInfo value1, FileInfo value2) => !(value1 == value2);

    public static bool operator ==(FileInfo value1, string value2) => value1.Value.Equals(value2);

    public static bool operator !=(FileInfo value1, string value2) => !value1.Value.Equals(value2);
}
