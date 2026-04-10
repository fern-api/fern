using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(AccountResourceType.AccountResourceTypeSerializer))]
[Serializable]
public readonly record struct AccountResourceType : IStringEnum
{
    public static readonly AccountResourceType Account = new(Values.Account);

    public AccountResourceType(string value)
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
    public static AccountResourceType FromCustom(string value)
    {
        return new AccountResourceType(value);
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

    public static bool operator ==(AccountResourceType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(AccountResourceType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(AccountResourceType value) => value.Value;

    public static explicit operator AccountResourceType(string value) => new(value);

    internal class AccountResourceTypeSerializer : JsonConverter<AccountResourceType>
    {
        public override AccountResourceType Read(
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
            return new AccountResourceType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            AccountResourceType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override AccountResourceType ReadAsPropertyName(
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
            return new AccountResourceType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            AccountResourceType value,
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
        public const string Account = "Account";
    }
}
