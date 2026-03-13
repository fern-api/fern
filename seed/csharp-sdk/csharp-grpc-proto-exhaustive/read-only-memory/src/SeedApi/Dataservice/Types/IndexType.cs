using System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(StringEnumSerializer<IndexType>))]
[Serializable]
public readonly record struct IndexType : IStringEnum
{
    public static readonly IndexType IndexTypeInvalid = new(Values.IndexTypeInvalid);

    public static readonly IndexType IndexTypeDefault = new(Values.IndexTypeDefault);

    public static readonly IndexType IndexTypeStrict = new(Values.IndexTypeStrict);

    public IndexType(string value)
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
    public static IndexType FromCustom(string value)
    {
        return new IndexType(value);
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

    public static bool operator ==(IndexType value1, string value2) => value1.Value.Equals(value2);

    public static bool operator !=(IndexType value1, string value2) => !value1.Value.Equals(value2);

    public static explicit operator string(IndexType value) => value.Value;

    public static explicit operator IndexType(string value) => new(value);

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    [Serializable]
    public static class Values
    {
        public const string IndexTypeInvalid = "INDEX_TYPE_INVALID";

        public const string IndexTypeDefault = "INDEX_TYPE_DEFAULT";

        public const string IndexTypeStrict = "INDEX_TYPE_STRICT";
    }
}
