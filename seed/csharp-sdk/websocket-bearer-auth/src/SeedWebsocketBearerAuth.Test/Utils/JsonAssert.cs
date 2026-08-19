using global::System.Text.Json;
using NUnit.Framework;
using SeedWebsocketBearerAuth.Core;

namespace SeedWebsocketBearerAuth.Test.Utils;

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
    /// Asserts that the given JSON string survives a deserialization/serialization round-trip.
    /// Deserializes to T, re-serializes to get the canonical form, then verifies a second
    /// round-trip produces the same canonical form (idempotency). This accounts for serializer
    /// options like WhenWritingNull that may normalize the output.
    /// </summary>
    internal static void Roundtrips<T>(string json)
    {
        var deserialized = JsonUtils.Deserialize<T>(json);
        var serialized = JsonUtils.Serialize(deserialized!);
        var deserialized2 = JsonUtils.Deserialize<T>(serialized);
        AreEqual(deserialized2!, serialized);
    }
}
