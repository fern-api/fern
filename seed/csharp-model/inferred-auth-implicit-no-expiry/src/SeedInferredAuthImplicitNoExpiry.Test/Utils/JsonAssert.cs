using global::System.Text.Json;
using NUnit.Framework;
using SeedInferredAuthImplicitNoExpiry.Core;

namespace SeedInferredAuthImplicitNoExpiry.Test.Utils;

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
    /// </summary>
    internal static void AreEqual(object actual, string expectedJson, JsonSerializerOptions options)
    {
        var actualType = actual.GetType();
        var actualElement = JsonSerializer.SerializeToElement(actual, actualType, options);
        var expectedElement = JsonSerializer.Deserialize<JsonElement>(expectedJson);
        Assert.That(actualElement, Is.EqualTo(expectedElement).UsingJsonElementComparer());
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
