// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using global::System.Text.Json;
using global::System.Text.Json.Nodes;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

/// <summary>
/// Undiscriminated union with multiple object variants.
/// This reproduces the Pipedream issue where Emitter is a union of
/// DeployedComponent, HttpInterface, and TimerInterface.
/// </summary>
[JsonConverter(typeof(MyUnion.JsonConverter))]
[Serializable]
public record MyUnion
{
    internal MyUnion(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of MyUnion with <see cref="MyUnion.A"/>.
    /// </summary>
    public MyUnion(MyUnion.A value)
    {
        Type = "A";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of MyUnion with <see cref="MyUnion.B"/>.
    /// </summary>
    public MyUnion(MyUnion.B value)
    {
        Type = "B";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of MyUnion with <see cref="MyUnion.C"/>.
    /// </summary>
    public MyUnion(MyUnion.C value)
    {
        Type = "C";
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
    /// Returns true if <see cref="Type"/> is "A"
    /// </summary>
    public bool IsA => Type == "A";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "B"
    /// </summary>
    public bool IsB => Type == "B";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "C"
    /// </summary>
    public bool IsC => Type == "C";

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.VariantA"/> if <see cref="Type"/> is 'A', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'A'.</exception>
    public SeedApi.VariantA AsA() =>
        IsA
            ? (SeedApi.VariantA)Value!
            : throw new global::System.Exception("MyUnion.Type is not 'A'");

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.VariantB"/> if <see cref="Type"/> is 'B', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'B'.</exception>
    public SeedApi.VariantB AsB() =>
        IsB
            ? (SeedApi.VariantB)Value!
            : throw new global::System.Exception("MyUnion.Type is not 'B'");

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.VariantC"/> if <see cref="Type"/> is 'C', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'C'.</exception>
    public SeedApi.VariantC AsC() =>
        IsC
            ? (SeedApi.VariantC)Value!
            : throw new global::System.Exception("MyUnion.Type is not 'C'");

    public T Match<T>(
        Func<SeedApi.VariantA, T> onA,
        Func<SeedApi.VariantB, T> onB,
        Func<SeedApi.VariantC, T> onC,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "A" => onA(AsA()),
            "B" => onB(AsB()),
            "C" => onC(AsC()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<SeedApi.VariantA> onA,
        Action<SeedApi.VariantB> onB,
        Action<SeedApi.VariantC> onC,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "A":
                onA(AsA());
                break;
            case "B":
                onB(AsB());
                break;
            case "C":
                onC(AsC());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.VariantA"/> and returns true if successful.
    /// </summary>
    public bool TryAsA(out SeedApi.VariantA? value)
    {
        if (Type == "A")
        {
            value = (SeedApi.VariantA)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.VariantB"/> and returns true if successful.
    /// </summary>
    public bool TryAsB(out SeedApi.VariantB? value)
    {
        if (Type == "B")
        {
            value = (SeedApi.VariantB)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.VariantC"/> and returns true if successful.
    /// </summary>
    public bool TryAsC(out SeedApi.VariantC? value)
    {
        if (Type == "C")
        {
            value = (SeedApi.VariantC)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator MyUnion(MyUnion.A value) => new(value);

    public static implicit operator MyUnion(MyUnion.B value) => new(value);

    public static implicit operator MyUnion(MyUnion.C value) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<MyUnion>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(MyUnion).IsAssignableFrom(typeToConvert);

        public override MyUnion Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
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

            // Strip the discriminant property to prevent it from leaking into AdditionalProperties
            var jsonObject = System.Text.Json.Nodes.JsonObject.Create(json);
            jsonObject?.Remove("type");
            var jsonWithoutDiscriminator =
                jsonObject != null ? JsonSerializer.SerializeToElement(jsonObject, options) : json;

            var value = discriminator switch
            {
                "A" => jsonWithoutDiscriminator.Deserialize<SeedApi.VariantA?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedApi.VariantA"),
                "B" => jsonWithoutDiscriminator.Deserialize<SeedApi.VariantB?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedApi.VariantB"),
                "C" => jsonWithoutDiscriminator.Deserialize<SeedApi.VariantC?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedApi.VariantC"),
                _ => json.Deserialize<object?>(options),
            };
            return new MyUnion(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            MyUnion value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "A" => JsonSerializer.SerializeToNode(value.Value, options),
                    "B" => JsonSerializer.SerializeToNode(value.Value, options),
                    "C" => JsonSerializer.SerializeToNode(value.Value, options),
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }

        public override MyUnion ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new JsonException("The JSON property name could not be read as a string.");
            return new MyUnion(stringValue, stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            MyUnion value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Type);
        }
    }

    /// <summary>
    /// Discriminated union type for A
    /// </summary>
    [Serializable]
    public struct A
    {
        public A(SeedApi.VariantA value)
        {
            Value = value;
        }

        internal SeedApi.VariantA Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator MyUnion.A(SeedApi.VariantA value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for B
    /// </summary>
    [Serializable]
    public struct B
    {
        public B(SeedApi.VariantB value)
        {
            Value = value;
        }

        internal SeedApi.VariantB Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator MyUnion.B(SeedApi.VariantB value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for C
    /// </summary>
    [Serializable]
    public struct C
    {
        public C(SeedApi.VariantC value)
        {
            Value = value;
        }

        internal SeedApi.VariantC Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator MyUnion.C(SeedApi.VariantC value) => new(value);
    }
}
