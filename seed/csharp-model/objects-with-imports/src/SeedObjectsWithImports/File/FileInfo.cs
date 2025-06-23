using System.Text.Json.Serialization;
using SeedObjectsWithImports.Core;

namespace SeedObjectsWithImports;

[JsonConverter(typeof(StringEnumSerializer<FileInfo>))]
[Serializable]
public readonly record struct FileInfo : IStringEnum
{
    /// <summary>
    /// A regular file (e.g. foo.txt).
    /// </summary>
    public static readonly FileInfo Regular = new(Values.Regular);

    /// <summary>
    /// A directory (e.g. foo/).
    /// </summary>
    public static readonly FileInfo Directory = new(Values.Directory);

    public FileInfo(string value)
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
    public static FileInfo FromCustom(string value)
    {
        return new FileInfo(value);
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

    public static bool operator ==(FileInfo value1, string value2) => value1.Value.Equals(value2);

    public static bool operator !=(FileInfo value1, string value2) => !value1.Value.Equals(value2);

    public static explicit operator string(FileInfo value) => value.Value;

    public static explicit operator FileInfo(string value) => new(value);

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    [Serializable]
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
}
