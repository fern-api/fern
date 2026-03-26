using global::System.Text.Json;
using NUnit.Framework;
using <%= namespaces.qualifiedCore%>;

namespace <%= namespace%>;

internal static class JsonAssert
{
    /// <summary>
    /// Asserts that the serialized JSON of an object equals the expected JSON string.
    /// Uses JsonElement comparison for reliable deep equality of collections and union types.
    /// </summary>
    internal static void AreEqual(object actual, string expectedJson)
    {
        var actualElement = JsonUtils.SerializeToElement(actual);
        var expectedElement = JsonUtils.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
    }

    /// <summary>
    /// Asserts that re-serializing <paramref name="actual"/> with the given
    /// <paramref name="options"/> produces JSON equivalent to <paramref name="expectedJson"/>.
    /// The actual object is serialized with the provided options and compared against the
    /// raw expected JSON. Null properties in the actual output are stripped (ASP.NET Core
    /// model binding does not distinguish between absent and null for nullable types).
    /// Properties present in the expected JSON but absent from the actual output are also
    /// stripped, because certain features (e.g. private <c>[JsonExtensionData]</c> fields)
    /// are invisible to the given serializer options.
    /// </summary>
    internal static void AreEqual(object actual, string expectedJson, JsonSerializerOptions options)
    {
        var actualType = actual.GetType();
        var actualElement = JsonSerializer.SerializeToElement(actual, actualType, options);
        var expectedElement = JsonSerializer.Deserialize<JsonElement>(expectedJson);
        var normalizedActual = StripNullProperties(actualElement);
        var normalizedExpected = IntersectKeys(StripNullProperties(expectedElement), normalizedActual);
        Assert.That(normalizedActual, Is.EqualTo(normalizedExpected).UsingJsonElementComparer());
    }

    /// <summary>
    /// Recursively removes properties whose value is <see cref="JsonValueKind.Null"/>
    /// from JSON objects so that { "x": null } compares equal to { } (missing key).
    /// </summary>
    private static JsonElement StripNullProperties(JsonElement element)
    {
        switch (element.ValueKind)
        {
            case JsonValueKind.Object:
            {
                using var stream = new global::System.IO.MemoryStream();
                using (var writer = new Utf8JsonWriter(stream))
                {
                    writer.WriteStartObject();
                    foreach (var prop in element.EnumerateObject())
                    {
                        if (prop.Value.ValueKind == JsonValueKind.Null)
                            continue;
                        writer.WritePropertyName(prop.Name);
                        StripNullProperties(prop.Value).WriteTo(writer);
                    }
                    writer.WriteEndObject();
                }
                return JsonDocument.Parse(stream.ToArray()).RootElement.Clone();
            }
            case JsonValueKind.Array:
            {
                using var stream = new global::System.IO.MemoryStream();
                using (var writer = new Utf8JsonWriter(stream))
                {
                    writer.WriteStartArray();
                    foreach (var item in element.EnumerateArray())
                    {
                        StripNullProperties(item).WriteTo(writer);
                    }
                    writer.WriteEndArray();
                }
                return JsonDocument.Parse(stream.ToArray()).RootElement.Clone();
            }
            default:
                return element;
        }
    }

    /// <summary>
    /// Returns a copy of <paramref name="source"/> containing only the properties
    /// that also exist in <paramref name="reference"/>. This handles types where
    /// certain properties (e.g. private <c>[JsonExtensionData]</c> fields) are present
    /// in the raw JSON but invisible to the serializer options under test.
    /// </summary>
    private static JsonElement IntersectKeys(JsonElement source, JsonElement reference)
    {
        if (source.ValueKind != JsonValueKind.Object || reference.ValueKind != JsonValueKind.Object)
            return source;

        var referenceKeys = new global::System.Collections.Generic.HashSet<string>();
        foreach (var prop in reference.EnumerateObject())
            referenceKeys.Add(prop.Name);

        using var stream = new global::System.IO.MemoryStream();
        using (var writer = new Utf8JsonWriter(stream))
        {
            writer.WriteStartObject();
            foreach (var prop in source.EnumerateObject())
            {
                if (!referenceKeys.Contains(prop.Name))
                    continue;
                writer.WritePropertyName(prop.Name);
                if (prop.Value.ValueKind == JsonValueKind.Object
                    && reference.TryGetProperty(prop.Name, out var refChild)
                    && refChild.ValueKind == JsonValueKind.Object)
                {
                    IntersectKeys(prop.Value, refChild).WriteTo(writer);
                }
                else
                {
                    prop.Value.WriteTo(writer);
                }
            }
            writer.WriteEndObject();
        }
        return JsonDocument.Parse(stream.ToArray()).RootElement.Clone();
    }

    /// <summary>
    /// Asserts that the given JSON string survives a deserialization/serialization round-trip
    /// intact: deserializes to T then re-serializes and compares to the original JSON.
    /// </summary>
    internal static void Roundtrips<T>(string json)
    {
        var deserialized = JsonUtils.Deserialize<T>(json);
        AreEqual(deserialized!, json);
    }

}
