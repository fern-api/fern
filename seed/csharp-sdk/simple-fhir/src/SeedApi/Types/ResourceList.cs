// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using global::System.Text.Json;
using global::System.Text.Json.Nodes;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(ResourceList.JsonConverter))]
[Serializable]
public record ResourceList
{
    internal ResourceList(string type, object? value)
    {
        ResourceType = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of ResourceList with <see cref="ResourceList.Account"/>.
    /// </summary>
    public ResourceList(ResourceList.Account value)
    {
        ResourceType = "Account";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of ResourceList with <see cref="ResourceList.Patient"/>.
    /// </summary>
    public ResourceList(ResourceList.Patient value)
    {
        ResourceType = "Patient";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of ResourceList with <see cref="ResourceList.Practitioner"/>.
    /// </summary>
    public ResourceList(ResourceList.Practitioner value)
    {
        ResourceType = "Practitioner";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of ResourceList with <see cref="ResourceList.Script"/>.
    /// </summary>
    public ResourceList(ResourceList.Script value)
    {
        ResourceType = "Script";
        Value = value.Value;
    }

    /// <summary>
    /// Discriminant value
    /// </summary>
    [JsonPropertyName("resource_type")]
    public string ResourceType { get; internal set; }

    /// <summary>
    /// Discriminated union value
    /// </summary>
    public object? Value { get; internal set; }

    /// <summary>
    /// Returns true if <see cref="ResourceType"/> is "Account"
    /// </summary>
    public bool IsAccount => ResourceType == "Account";

    /// <summary>
    /// Returns true if <see cref="ResourceType"/> is "Patient"
    /// </summary>
    public bool IsPatient => ResourceType == "Patient";

    /// <summary>
    /// Returns true if <see cref="ResourceType"/> is "Practitioner"
    /// </summary>
    public bool IsPractitioner => ResourceType == "Practitioner";

    /// <summary>
    /// Returns true if <see cref="ResourceType"/> is "Script"
    /// </summary>
    public bool IsScript => ResourceType == "Script";

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.Account"/> if <see cref="ResourceType"/> is 'Account', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="ResourceType"/> is not 'Account'.</exception>
    public SeedApi.Account AsAccount() =>
        IsAccount
            ? (SeedApi.Account)Value!
            : throw new global::System.Exception("ResourceList.ResourceType is not 'Account'");

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.Patient"/> if <see cref="ResourceType"/> is 'Patient', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="ResourceType"/> is not 'Patient'.</exception>
    public SeedApi.Patient AsPatient() =>
        IsPatient
            ? (SeedApi.Patient)Value!
            : throw new global::System.Exception("ResourceList.ResourceType is not 'Patient'");

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.Practitioner"/> if <see cref="ResourceType"/> is 'Practitioner', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="ResourceType"/> is not 'Practitioner'.</exception>
    public SeedApi.Practitioner AsPractitioner() =>
        IsPractitioner
            ? (SeedApi.Practitioner)Value!
            : throw new global::System.Exception("ResourceList.ResourceType is not 'Practitioner'");

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.Script"/> if <see cref="ResourceType"/> is 'Script', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="ResourceType"/> is not 'Script'.</exception>
    public SeedApi.Script AsScript() =>
        IsScript
            ? (SeedApi.Script)Value!
            : throw new global::System.Exception("ResourceList.ResourceType is not 'Script'");

    public T Match<T>(
        Func<SeedApi.Account, T> onAccount,
        Func<SeedApi.Patient, T> onPatient,
        Func<SeedApi.Practitioner, T> onPractitioner,
        Func<SeedApi.Script, T> onScript,
        Func<string, object?, T> onUnknown_
    )
    {
        return ResourceType switch
        {
            "Account" => onAccount(AsAccount()),
            "Patient" => onPatient(AsPatient()),
            "Practitioner" => onPractitioner(AsPractitioner()),
            "Script" => onScript(AsScript()),
            _ => onUnknown_(ResourceType, Value),
        };
    }

    public void Visit(
        Action<SeedApi.Account> onAccount,
        Action<SeedApi.Patient> onPatient,
        Action<SeedApi.Practitioner> onPractitioner,
        Action<SeedApi.Script> onScript,
        Action<string, object?> onUnknown_
    )
    {
        switch (ResourceType)
        {
            case "Account":
                onAccount(AsAccount());
                break;
            case "Patient":
                onPatient(AsPatient());
                break;
            case "Practitioner":
                onPractitioner(AsPractitioner());
                break;
            case "Script":
                onScript(AsScript());
                break;
            default:
                onUnknown_(ResourceType, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.Account"/> and returns true if successful.
    /// </summary>
    public bool TryAsAccount(out SeedApi.Account? value)
    {
        if (ResourceType == "Account")
        {
            value = (SeedApi.Account)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.Patient"/> and returns true if successful.
    /// </summary>
    public bool TryAsPatient(out SeedApi.Patient? value)
    {
        if (ResourceType == "Patient")
        {
            value = (SeedApi.Patient)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.Practitioner"/> and returns true if successful.
    /// </summary>
    public bool TryAsPractitioner(out SeedApi.Practitioner? value)
    {
        if (ResourceType == "Practitioner")
        {
            value = (SeedApi.Practitioner)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.Script"/> and returns true if successful.
    /// </summary>
    public bool TryAsScript(out SeedApi.Script? value)
    {
        if (ResourceType == "Script")
        {
            value = (SeedApi.Script)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator ResourceList(ResourceList.Account value) => new(value);

    public static implicit operator ResourceList(ResourceList.Patient value) => new(value);

    public static implicit operator ResourceList(ResourceList.Practitioner value) => new(value);

    public static implicit operator ResourceList(ResourceList.Script value) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<ResourceList>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(ResourceList).IsAssignableFrom(typeToConvert);

        public override ResourceList Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = JsonElement.ParseValue(ref reader);
            if (!json.TryGetProperty("resource_type", out var discriminatorElement))
            {
                throw new JsonException("Missing discriminator property 'resource_type'");
            }
            if (discriminatorElement.ValueKind != JsonValueKind.String)
            {
                if (discriminatorElement.ValueKind == JsonValueKind.Null)
                {
                    throw new JsonException("Discriminator property 'resource_type' is null");
                }

                throw new JsonException(
                    $"Discriminator property 'resource_type' is not a string, instead is {discriminatorElement.ToString()}"
                );
            }

            var discriminator =
                discriminatorElement.GetString()
                ?? throw new JsonException("Discriminator property 'resource_type' is null");

            var value = discriminator switch
            {
                "Account" => json.Deserialize<SeedApi.Account?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedApi.Account"),
                "Patient" => json.Deserialize<SeedApi.Patient?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedApi.Patient"),
                "Practitioner" => json.Deserialize<SeedApi.Practitioner?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedApi.Practitioner"),
                "Script" => json.Deserialize<SeedApi.Script?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedApi.Script"),
                _ => json.Deserialize<object?>(options),
            };
            return new ResourceList(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            ResourceList value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.ResourceType switch
                {
                    "Account" => JsonSerializer.SerializeToNode(value.Value, options),
                    "Patient" => JsonSerializer.SerializeToNode(value.Value, options),
                    "Practitioner" => JsonSerializer.SerializeToNode(value.Value, options),
                    "Script" => JsonSerializer.SerializeToNode(value.Value, options),
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["resource_type"] = value.ResourceType;
            json.WriteTo(writer, options);
        }

        public override ResourceList ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new JsonException("The JSON property name could not be read as a string.");
            return new ResourceList(stringValue, stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            ResourceList value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.ResourceType);
        }
    }

    /// <summary>
    /// Discriminated union type for Account
    /// </summary>
    [Serializable]
    public struct Account
    {
        public Account(SeedApi.Account value)
        {
            Value = value;
        }

        internal SeedApi.Account Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator ResourceList.Account(SeedApi.Account value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for Patient
    /// </summary>
    [Serializable]
    public struct Patient
    {
        public Patient(SeedApi.Patient value)
        {
            Value = value;
        }

        internal SeedApi.Patient Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator ResourceList.Patient(SeedApi.Patient value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for Practitioner
    /// </summary>
    [Serializable]
    public struct Practitioner
    {
        public Practitioner(SeedApi.Practitioner value)
        {
            Value = value;
        }

        internal SeedApi.Practitioner Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator ResourceList.Practitioner(SeedApi.Practitioner value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for Script
    /// </summary>
    [Serializable]
    public struct Script
    {
        public Script(SeedApi.Script value)
        {
            Value = value;
        }

        internal SeedApi.Script Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator ResourceList.Script(SeedApi.Script value) => new(value);
    }
}
