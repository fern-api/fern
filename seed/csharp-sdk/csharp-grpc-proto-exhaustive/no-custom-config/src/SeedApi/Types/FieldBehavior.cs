using System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(StringEnumSerializer<FieldBehavior>))]
[Serializable]
public readonly record struct FieldBehavior : IStringEnum
{
    public static readonly FieldBehavior FieldBehaviorUnspecified = new(
        Values.FieldBehaviorUnspecified
    );

    public static readonly FieldBehavior Optional = new(Values.Optional);

    public static readonly FieldBehavior Required = new(Values.Required);

    public static readonly FieldBehavior OutputOnly = new(Values.OutputOnly);

    public static readonly FieldBehavior InputOnly = new(Values.InputOnly);

    public static readonly FieldBehavior Immutable = new(Values.Immutable);

    public static readonly FieldBehavior UnorderedList = new(Values.UnorderedList);

    public static readonly FieldBehavior NonEmptyDefault = new(Values.NonEmptyDefault);

    public static readonly FieldBehavior Identifier = new(Values.Identifier);

    public FieldBehavior(string value)
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
    public static FieldBehavior FromCustom(string value)
    {
        return new FieldBehavior(value);
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

    public static bool operator ==(FieldBehavior value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(FieldBehavior value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(FieldBehavior value) => value.Value;

    public static explicit operator FieldBehavior(string value) => new(value);

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    [Serializable]
    public static class Values
    {
        public const string FieldBehaviorUnspecified = "FIELD_BEHAVIOR_UNSPECIFIED";

        public const string Optional = "OPTIONAL";

        public const string Required = "REQUIRED";

        public const string OutputOnly = "OUTPUT_ONLY";

        public const string InputOnly = "INPUT_ONLY";

        public const string Immutable = "IMMUTABLE";

        public const string UnorderedList = "UNORDERED_LIST";

        public const string NonEmptyDefault = "NON_EMPTY_DEFAULT";

        public const string Identifier = "IDENTIFIER";
    }
}
