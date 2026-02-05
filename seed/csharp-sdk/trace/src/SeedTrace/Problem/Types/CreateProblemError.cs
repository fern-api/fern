// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(CreateProblemError.JsonConverter))]
[Serializable]
public record CreateProblemError
{
    internal CreateProblemError(string type, object? value)
    {
        ErrorType = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of CreateProblemError with <see cref="CreateProblemError.Generic"/>.
    /// </summary>
    public CreateProblemError(CreateProblemError.Generic value)
    {
        ErrorType = "generic";
        Value = value.Value;
    }

    /// <summary>
    /// Discriminant value
    /// </summary>
    [JsonPropertyName("errorType")]
    public string ErrorType { get; internal set; }

    /// <summary>
    /// Discriminated union value
    /// </summary>
    public object? Value { get; internal set; }

    /// <summary>
    /// Returns true if <see cref="ErrorType"/> is "generic"
    /// </summary>
    public bool IsGeneric => ErrorType == "generic";

    /// <summary>
    /// Returns the value as a <see cref="SeedTrace.GenericCreateProblemError"/> if <see cref="ErrorType"/> is 'generic', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="ErrorType"/> is not 'generic'.</exception>
    public SeedTrace.GenericCreateProblemError AsGeneric() =>
        IsGeneric
            ? (SeedTrace.GenericCreateProblemError)Value!
            : throw new System.Exception("CreateProblemError.ErrorType is not 'generic'");

    public T Match<T>(
        Func<SeedTrace.GenericCreateProblemError, T> onGeneric,
        Func<string, object?, T> onUnknown_
    )
    {
        return ErrorType switch
        {
            "generic" => onGeneric(AsGeneric()),
            _ => onUnknown_(ErrorType, Value),
        };
    }

    public void Visit(
        Action<SeedTrace.GenericCreateProblemError> onGeneric,
        Action<string, object?> onUnknown_
    )
    {
        switch (ErrorType)
        {
            case "generic":
                onGeneric(AsGeneric());
                break;
            default:
                onUnknown_(ErrorType, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedTrace.GenericCreateProblemError"/> and returns true if successful.
    /// </summary>
    public bool TryAsGeneric(out SeedTrace.GenericCreateProblemError? value)
    {
        if (ErrorType == "generic")
        {
            value = (SeedTrace.GenericCreateProblemError)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator CreateProblemError(CreateProblemError.Generic value) =>
        new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<CreateProblemError>
    {
        public override bool CanConvert(System.Type typeToConvert) =>
            typeof(CreateProblemError).IsAssignableFrom(typeToConvert);

        public override CreateProblemError Read(
            ref Utf8JsonReader reader,
            System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = JsonElement.ParseValue(ref reader);
            if (!json.TryGetProperty("_type", out var discriminatorElement))
            {
                throw new JsonException("Missing discriminator property '_type'");
            }
            if (discriminatorElement.ValueKind != JsonValueKind.String)
            {
                if (discriminatorElement.ValueKind == JsonValueKind.Null)
                {
                    throw new JsonException("Discriminator property '_type' is null");
                }

                throw new JsonException(
                    $"Discriminator property '_type' is not a string, instead is {discriminatorElement.ToString()}"
                );
            }

            var discriminator =
                discriminatorElement.GetString()
                ?? throw new JsonException("Discriminator property '_type' is null");

            var value = discriminator switch
            {
                "generic" => json.Deserialize<SeedTrace.GenericCreateProblemError?>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize SeedTrace.GenericCreateProblemError"
                    ),
                _ => json.Deserialize<object?>(options),
            };
            return new CreateProblemError(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            CreateProblemError value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.ErrorType switch
                {
                    "generic" => JsonSerializer.SerializeToNode(value.Value, options),
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["_type"] = value.ErrorType;
            json.WriteTo(writer, options);
        }
    }

    /// <summary>
    /// Discriminated union type for generic
    /// </summary>
    [Serializable]
    public struct Generic
    {
        public Generic(SeedTrace.GenericCreateProblemError value)
        {
            Value = value;
        }

        internal SeedTrace.GenericCreateProblemError Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator CreateProblemError.Generic(
            SeedTrace.GenericCreateProblemError value
        ) => new(value);
    }
}
