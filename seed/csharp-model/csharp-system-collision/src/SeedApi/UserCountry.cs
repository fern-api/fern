using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(UserCountry.UserCountrySerializer))]
[Serializable]
public readonly record struct UserCountry : IStringEnum
{
    public static readonly UserCountry Usa = new(Values.Usa);

    public UserCountry(string value)
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
    public static UserCountry FromCustom(string value)
    {
        return new UserCountry(value);
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

    public static bool operator ==(UserCountry value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(UserCountry value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(UserCountry value) => value.Value;

    public static explicit operator UserCountry(string value) => new(value);

    internal class UserCountrySerializer : JsonConverter<UserCountry>
    {
        public override UserCountry Read(
            ref Utf8JsonReader reader,
            Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new global::System.Exception(
                    "The JSON value could not be read as a string."
                );
            return new UserCountry(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            UserCountry value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override UserCountry ReadAsPropertyName(
            ref Utf8JsonReader reader,
            Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new global::System.Exception(
                    "The JSON property name could not be read as a string."
                );
            return new UserCountry(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            UserCountry value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Value);
        }
    }

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    [Serializable]
    public static class Values
    {
        public const string Usa = "USA";
    }
}
