using global::System.Text.Json;
using NUnit.Framework;
using SeedQueryParameters.Core;

namespace SeedQueryParameters.Test.Utils;

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
    /// The expected JSON is parsed as a raw <see cref="JsonElement"/> so the comparison
    /// validates that a deserialize → serialize round-trip through <paramref name="options"/>
    /// preserves the original payload.
    /// Explicit null properties in the actual output are treated as equivalent to missing
    /// properties in the expected JSON (ASP.NET Core model binding does not distinguish
    /// between absent and null for nullable reference/collection types).
    /// </summary>
    internal static void AreEqual(object actual, string expectedJson, JsonSerializerOptions options)
    {
        var actualType = actual.GetType();
        var actualElement = JsonSerializer.SerializeToElement(actual, actualType, options);
        var expectedElement = JsonSerializer.Deserialize<JsonElement>(expectedJson);
        var normalizedActual = StripNullProperties(actualElement);
        var normalizedExpected = StripNullProperties(expectedElement);
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
                using var doc = JsonDocument.Parse("{}");
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
    /// Asserts that the given JSON string survives a deserialization/serialization round-trip
    /// intact: deserializes to T then re-serializes and compares to the original JSON.
    /// </summary>
    internal static void Roundtrips<T>(string json)
    {
        var deserialized = JsonUtils.Deserialize<T>(json);
        AreEqual(deserialized!, json);
    }
}
