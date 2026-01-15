// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedNullableOptional.Core;

namespace SeedNullableOptional;

/// <summary>
/// Discriminated union for testing nullable unions
/// </summary>
[JsonConverter(typeof(NotificationMethod.JsonConverter))]
[Serializable]
public record NotificationMethod
{
    internal NotificationMethod(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of NotificationMethod with <see cref="NotificationMethod.Email"/>.
    /// </summary>
    public NotificationMethod(NotificationMethod.Email value)
    {
        Type = "email";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of NotificationMethod with <see cref="NotificationMethod.Sms"/>.
    /// </summary>
    public NotificationMethod(NotificationMethod.Sms value)
    {
        Type = "sms";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of NotificationMethod with <see cref="NotificationMethod.Push"/>.
    /// </summary>
    public NotificationMethod(NotificationMethod.Push value)
    {
        Type = "push";
        Value = value.Value;
    }

    /// <summary>
    /// Discriminant value
    /// </summary>
    [JsonPropertyName("type")]
    public string Type { get; internal set; }

    /// <summary>
    /// Discriminated union value
    /// </summary>
    public object? Value { get; internal set; }

    /// <summary>
    /// Returns true if <see cref="Type"/> is "email"
    /// </summary>
    public bool IsEmail => Type == "email";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "sms"
    /// </summary>
    public bool IsSms => Type == "sms";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "push"
    /// </summary>
    public bool IsPush => Type == "push";

    /// <summary>
    /// Returns the value as a <see cref="SeedNullableOptional.EmailNotification"/> if <see cref="Type"/> is 'email', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'email'.</exception>
    public SeedNullableOptional.EmailNotification AsEmail() =>
        IsEmail
            ? (SeedNullableOptional.EmailNotification)Value!
            : throw new System.Exception("NotificationMethod.Type is not 'email'");

    /// <summary>
    /// Returns the value as a <see cref="SeedNullableOptional.SmsNotification"/> if <see cref="Type"/> is 'sms', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'sms'.</exception>
    public SeedNullableOptional.SmsNotification AsSms() =>
        IsSms
            ? (SeedNullableOptional.SmsNotification)Value!
            : throw new System.Exception("NotificationMethod.Type is not 'sms'");

    /// <summary>
    /// Returns the value as a <see cref="SeedNullableOptional.PushNotification"/> if <see cref="Type"/> is 'push', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'push'.</exception>
    public SeedNullableOptional.PushNotification AsPush() =>
        IsPush
            ? (SeedNullableOptional.PushNotification)Value!
            : throw new System.Exception("NotificationMethod.Type is not 'push'");

    public T Match<T>(
        Func<SeedNullableOptional.EmailNotification, T> onEmail,
        Func<SeedNullableOptional.SmsNotification, T> onSms,
        Func<SeedNullableOptional.PushNotification, T> onPush,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "email" => onEmail(AsEmail()),
            "sms" => onSms(AsSms()),
            "push" => onPush(AsPush()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<SeedNullableOptional.EmailNotification> onEmail,
        Action<SeedNullableOptional.SmsNotification> onSms,
        Action<SeedNullableOptional.PushNotification> onPush,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "email":
                onEmail(AsEmail());
                break;
            case "sms":
                onSms(AsSms());
                break;
            case "push":
                onPush(AsPush());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedNullableOptional.EmailNotification"/> and returns true if successful.
    /// </summary>
    public bool TryAsEmail(out SeedNullableOptional.EmailNotification? value)
    {
        if (Type == "email")
        {
            value = (SeedNullableOptional.EmailNotification)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedNullableOptional.SmsNotification"/> and returns true if successful.
    /// </summary>
    public bool TryAsSms(out SeedNullableOptional.SmsNotification? value)
    {
        if (Type == "sms")
        {
            value = (SeedNullableOptional.SmsNotification)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedNullableOptional.PushNotification"/> and returns true if successful.
    /// </summary>
    public bool TryAsPush(out SeedNullableOptional.PushNotification? value)
    {
        if (Type == "push")
        {
            value = (SeedNullableOptional.PushNotification)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator NotificationMethod(NotificationMethod.Email value) =>
        new(value);

    public static implicit operator NotificationMethod(NotificationMethod.Sms value) => new(value);

    public static implicit operator NotificationMethod(NotificationMethod.Push value) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<NotificationMethod>
    {
        public override bool CanConvert(System.Type typeToConvert) =>
            typeof(NotificationMethod).IsAssignableFrom(typeToConvert);

        public override NotificationMethod Read(
            ref Utf8JsonReader reader,
            System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = JsonElement.ParseValue(ref reader);
            if (!json.TryGetProperty("type", out var discriminatorElement))
            {
                throw new JsonException("Missing discriminator property 'type'");
            }
            if (discriminatorElement.ValueKind != JsonValueKind.String)
            {
                if (discriminatorElement.ValueKind == JsonValueKind.Null)
                {
                    throw new JsonException("Discriminator property 'type' is null");
                }

                throw new JsonException(
                    $"Discriminator property 'type' is not a string, instead is {discriminatorElement.ToString()}"
                );
            }

            var discriminator =
                discriminatorElement.GetString()
                ?? throw new JsonException("Discriminator property 'type' is null");

            var value = discriminator switch
            {
                "email" => json.Deserialize<SeedNullableOptional.EmailNotification?>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize SeedNullableOptional.EmailNotification"
                    ),
                "sms" => json.Deserialize<SeedNullableOptional.SmsNotification?>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize SeedNullableOptional.SmsNotification"
                    ),
                "push" => json.Deserialize<SeedNullableOptional.PushNotification?>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize SeedNullableOptional.PushNotification"
                    ),
                _ => json.Deserialize<object?>(options),
            };
            return new NotificationMethod(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            NotificationMethod value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "email" => JsonSerializer.SerializeToNode(value.Value, options),
                    "sms" => JsonSerializer.SerializeToNode(value.Value, options),
                    "push" => JsonSerializer.SerializeToNode(value.Value, options),
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }
    }

    /// <summary>
    /// Discriminated union type for email
    /// </summary>
    [Serializable]
    public struct Email
    {
        public Email(SeedNullableOptional.EmailNotification value)
        {
            Value = value;
        }

        internal SeedNullableOptional.EmailNotification Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator NotificationMethod.Email(
            SeedNullableOptional.EmailNotification value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for sms
    /// </summary>
    [Serializable]
    public struct Sms
    {
        public Sms(SeedNullableOptional.SmsNotification value)
        {
            Value = value;
        }

        internal SeedNullableOptional.SmsNotification Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator NotificationMethod.Sms(
            SeedNullableOptional.SmsNotification value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for push
    /// </summary>
    [Serializable]
    public struct Push
    {
        public Push(SeedNullableOptional.PushNotification value)
        {
            Value = value;
        }

        internal SeedNullableOptional.PushNotification Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator NotificationMethod.Push(
            SeedNullableOptional.PushNotification value
        ) => new(value);
    }
}
