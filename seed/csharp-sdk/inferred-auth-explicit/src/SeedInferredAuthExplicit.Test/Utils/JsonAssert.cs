using global::System.Text.Json;
using NUnit.Framework;
using SeedInferredAuthExplicit.Core;

namespace SeedInferredAuthExplicit.Test.Utils;

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
    /// Asserts that the serialized JSON of an object equals the expected JSON string,
    /// normalizing both sides through the provided serializer options. The expected JSON
    /// is deserialized (using the actual object's runtime type) and re-serialized so that
    /// both sides undergo the same round-trip. This ensures a fair comparison even when
    /// certain features (e.g. private [JsonExtensionData] fields) are not visible to the
    /// given serializer options.
    /// </summary>
    internal static void AreEqual(object actual, string expectedJson, JsonSerializerOptions options)
    {
        var actualType = actual.GetType();
        var actualElement = JsonSerializer.SerializeToElement(actual, actualType, options);
        var expectedDeserialized = JsonSerializer.Deserialize(expectedJson, actualType, options);
        var expectedElement = JsonSerializer.SerializeToElement(
            expectedDeserialized!,
            actualType,
            options
        );
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
