using global::System.Text.Json;
using NUnit.Framework;
using SeedHttpHead.Core;

namespace SeedHttpHead.Test.Utils;

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
    /// Asserts that the given JSON string survives a deserialization/serialization round-trip
    /// intact: deserializes to T then re-serializes and compares to the original JSON.
    /// </summary>
    internal static void Roundtrips<T>(string json)
    {
        var deserialized = JsonUtils.Deserialize<T>(json);
        AreEqual(deserialized!, json);
    }
}
