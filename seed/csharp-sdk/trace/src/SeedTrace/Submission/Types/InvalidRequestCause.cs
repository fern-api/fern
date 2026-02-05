// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(InvalidRequestCause.JsonConverter))]
[Serializable]
public record InvalidRequestCause
{
    internal InvalidRequestCause(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of InvalidRequestCause with <see cref="InvalidRequestCause.SubmissionIdNotFound"/>.
    /// </summary>
    public InvalidRequestCause(InvalidRequestCause.SubmissionIdNotFound value)
    {
        Type = "submissionIdNotFound";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of InvalidRequestCause with <see cref="InvalidRequestCause.CustomTestCasesUnsupported"/>.
    /// </summary>
    public InvalidRequestCause(InvalidRequestCause.CustomTestCasesUnsupported value)
    {
        Type = "customTestCasesUnsupported";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of InvalidRequestCause with <see cref="InvalidRequestCause.UnexpectedLanguage"/>.
    /// </summary>
    public InvalidRequestCause(InvalidRequestCause.UnexpectedLanguage value)
    {
        Type = "unexpectedLanguage";
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
    /// Returns true if <see cref="Type"/> is "submissionIdNotFound"
    /// </summary>
    public bool IsSubmissionIdNotFound => Type == "submissionIdNotFound";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "customTestCasesUnsupported"
    /// </summary>
    public bool IsCustomTestCasesUnsupported => Type == "customTestCasesUnsupported";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "unexpectedLanguage"
    /// </summary>
    public bool IsUnexpectedLanguage => Type == "unexpectedLanguage";

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.SubmissionIdNotFound"/> if <see cref="Type"/> is 'submissionIdNotFound', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'submissionIdNotFound'.</exception>
    public SeedTrace.SubmissionIdNotFound AsSubmissionIdNotFound() =>
        IsSubmissionIdNotFound
            ? (SeedTrace.SubmissionIdNotFound)Value!
            : throw new System.Exception("InvalidRequestCause.Type is not 'submissionIdNotFound'");

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.CustomTestCasesUnsupported"/> if <see cref="Type"/> is 'customTestCasesUnsupported', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'customTestCasesUnsupported'.</exception>
    public SeedTrace.CustomTestCasesUnsupported AsCustomTestCasesUnsupported() =>
        IsCustomTestCasesUnsupported
            ? (SeedTrace.CustomTestCasesUnsupported)Value!
            : throw new System.Exception(
                "InvalidRequestCause.Type is not 'customTestCasesUnsupported'"
            );

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.UnexpectedLanguageError"/> if <see cref="Type"/> is 'unexpectedLanguage', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'unexpectedLanguage'.</exception>
    public SeedTrace.UnexpectedLanguageError AsUnexpectedLanguage() =>
        IsUnexpectedLanguage
            ? (SeedTrace.UnexpectedLanguageError)Value!
            : throw new System.Exception("InvalidRequestCause.Type is not 'unexpectedLanguage'");

    public T Match<T>(
        Func<SeedTrace.SubmissionIdNotFound, T> onSubmissionIdNotFound,
        Func<SeedTrace.CustomTestCasesUnsupported, T> onCustomTestCasesUnsupported,
        Func<SeedTrace.UnexpectedLanguageError, T> onUnexpectedLanguage,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "submissionIdNotFound" => onSubmissionIdNotFound(AsSubmissionIdNotFound()),
            "customTestCasesUnsupported" => onCustomTestCasesUnsupported(
                AsCustomTestCasesUnsupported()
            ),
            "unexpectedLanguage" => onUnexpectedLanguage(AsUnexpectedLanguage()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<SeedTrace.SubmissionIdNotFound> onSubmissionIdNotFound,
        Action<SeedTrace.CustomTestCasesUnsupported> onCustomTestCasesUnsupported,
        Action<SeedTrace.UnexpectedLanguageError> onUnexpectedLanguage,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "submissionIdNotFound":
                onSubmissionIdNotFound(AsSubmissionIdNotFound());
                break;
            case "customTestCasesUnsupported":
                onCustomTestCasesUnsupported(AsCustomTestCasesUnsupported());
                break;
            case "unexpectedLanguage":
                onUnexpectedLanguage(AsUnexpectedLanguage());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedTrace.SubmissionIdNotFound"/> and returns true if successful.
    /// </summary>
    public bool TryAsSubmissionIdNotFound(out SeedTrace.SubmissionIdNotFound? value)
    {
        if (Type == "submissionIdNotFound")
        {
            value = (SeedTrace.SubmissionIdNotFound)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedTrace.CustomTestCasesUnsupported"/> and returns true if successful.
    /// </summary>
    public bool TryAsCustomTestCasesUnsupported(out SeedTrace.CustomTestCasesUnsupported? value)
    {
        if (Type == "customTestCasesUnsupported")
        {
            value = (SeedTrace.CustomTestCasesUnsupported)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedTrace.UnexpectedLanguageError"/> and returns true if successful.
    /// </summary>
    public bool TryAsUnexpectedLanguage(out SeedTrace.UnexpectedLanguageError? value)
    {
        if (Type == "unexpectedLanguage")
        {
            value = (SeedTrace.UnexpectedLanguageError)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator InvalidRequestCause(
        InvalidRequestCause.SubmissionIdNotFound value
    ) => new(value);

    public static implicit operator InvalidRequestCause(
        InvalidRequestCause.CustomTestCasesUnsupported value
    ) => new(value);

    public static implicit operator InvalidRequestCause(
        InvalidRequestCause.UnexpectedLanguage value
    ) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<InvalidRequestCause>
    {
        public override bool CanConvert(System.Type typeToConvert) =>
            typeof(InvalidRequestCause).IsAssignableFrom(typeToConvert);

        public override InvalidRequestCause Read(
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
                "submissionIdNotFound" => json.Deserialize<SeedTrace.SubmissionIdNotFound?>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize SeedTrace.SubmissionIdNotFound"
                    ),
                "customTestCasesUnsupported" =>
                    json.Deserialize<SeedTrace.CustomTestCasesUnsupported?>(options)
                        ?? throw new JsonException(
                            "Failed to deserialize SeedTrace.CustomTestCasesUnsupported"
                        ),
                "unexpectedLanguage" => json.Deserialize<SeedTrace.UnexpectedLanguageError?>(
                    options
                )
                    ?? throw new JsonException(
                        "Failed to deserialize SeedTrace.UnexpectedLanguageError"
                    ),
                _ => json.Deserialize<object?>(options),
            };
            return new InvalidRequestCause(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            InvalidRequestCause value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "submissionIdNotFound" => JsonSerializer.SerializeToNode(value.Value, options),
                    "customTestCasesUnsupported" => JsonSerializer.SerializeToNode(
                        value.Value,
                        options
                    ),
                    "unexpectedLanguage" => JsonSerializer.SerializeToNode(value.Value, options),
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }
    }

    /// <summary>
    /// Discriminated union type for submissionIdNotFound
    /// </summary>
    [Serializable]
    public struct SubmissionIdNotFound
    {
        public SubmissionIdNotFound(SeedTrace.SubmissionIdNotFound value)
        {
            Value = value;
        }

        internal SeedTrace.SubmissionIdNotFound Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator InvalidRequestCause.SubmissionIdNotFound(
            SeedTrace.SubmissionIdNotFound value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for customTestCasesUnsupported
    /// </summary>
    [Serializable]
    public struct CustomTestCasesUnsupported
    {
        public CustomTestCasesUnsupported(SeedTrace.CustomTestCasesUnsupported value)
        {
            Value = value;
        }

        internal SeedTrace.CustomTestCasesUnsupported Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator InvalidRequestCause.CustomTestCasesUnsupported(
            SeedTrace.CustomTestCasesUnsupported value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for unexpectedLanguage
    /// </summary>
    [Serializable]
    public struct UnexpectedLanguage
    {
        public UnexpectedLanguage(SeedTrace.UnexpectedLanguageError value)
        {
            Value = value;
        }

        internal SeedTrace.UnexpectedLanguageError Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator InvalidRequestCause.UnexpectedLanguage(
            SeedTrace.UnexpectedLanguageError value
        ) => new(value);
    }
}
