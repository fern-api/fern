using System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(StringEnumSerializer<AspectRatio>))]
[Serializable]
public readonly record struct AspectRatio : IStringEnum
{
    public static readonly AspectRatio AspectRatioUnspecified = new(Values.AspectRatioUnspecified);

    public static readonly AspectRatio AspectRatio11 = new(Values.AspectRatio11);

    public static readonly AspectRatio AspectRatio169 = new(Values.AspectRatio169);

    public static readonly AspectRatio AspectRatio916 = new(Values.AspectRatio916);

    public static readonly AspectRatio AspectRatio43 = new(Values.AspectRatio43);

    public AspectRatio(string value)
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
    public static AspectRatio FromCustom(string value)
    {
        return new AspectRatio(value);
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

    public static bool operator ==(AspectRatio value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(AspectRatio value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(AspectRatio value) => value.Value;

    public static explicit operator AspectRatio(string value) => new(value);

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    [Serializable]
    public static class Values
    {
        public const string AspectRatioUnspecified = "ASPECT_RATIO_UNSPECIFIED";

        public const string AspectRatio11 = "ASPECT_RATIO_1_1";

        public const string AspectRatio169 = "ASPECT_RATIO_16_9";

        public const string AspectRatio916 = "ASPECT_RATIO_9_16";

        public const string AspectRatio43 = "ASPECT_RATIO_4_3";
    }
}
