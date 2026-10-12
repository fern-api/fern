using global::System.Text.Json.Nodes;
using global::System.Text.Json.Serialization;
using NUnit.Framework;
using SeedValidation.Core;

namespace SeedValidation.Test.Core.Json;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class SerializeWithAdditionalPropertiesTests
{
    [Test]
    public void NullAdditionalProperties_SerializesBodyAsIs()
    {
        var json = JsonUtils.SerializeWithAdditionalProperties(
            new TestBody { Name = "fern", Count = 1 },
            null
        );

        var node = JsonNode.Parse(json)!.AsObject();
        Assert.That(node["name"]!.GetValue<string>(), Is.EqualTo("fern"));
        Assert.That(node["count"]!.GetValue<int>(), Is.EqualTo(1));
    }

    [Test]
    public void NullBody_SerializesAdditionalPropertiesAsBody()
    {
        var json = JsonUtils.SerializeWithAdditionalProperties<object?>(
            null,
            new Dictionary<string, object?> { ["beta_flag"] = true, ["label"] = "value" }
        );

        var node = JsonNode.Parse(json)!.AsObject();
        Assert.That(node.Count, Is.EqualTo(2));
        Assert.That(node["beta_flag"]!.GetValue<bool>(), Is.True);
        Assert.That(node["label"]!.GetValue<string>(), Is.EqualTo("value"));
    }

    [Test]
    public void AdditionalProperties_AddsNewKeys()
    {
        var json = JsonUtils.SerializeWithAdditionalProperties(
            new TestBody { Name = "fern", Count = 1 },
            new Dictionary<string, object?> { ["extra"] = "value" }
        );

        var node = JsonNode.Parse(json)!.AsObject();
        Assert.That(node["name"]!.GetValue<string>(), Is.EqualTo("fern"));
        Assert.That(node["count"]!.GetValue<int>(), Is.EqualTo(1));
        Assert.That(node["extra"]!.GetValue<string>(), Is.EqualTo("value"));
    }

    [Test]
    public void AdditionalProperties_OverrideCollidingKeys()
    {
        var json = JsonUtils.SerializeWithAdditionalProperties(
            new TestBody { Name = "fern", Count = 1 },
            new Dictionary<string, object?> { ["name"] = "override", ["count"] = null }
        );

        var node = JsonNode.Parse(json)!.AsObject();
        Assert.That(node["name"]!.GetValue<string>(), Is.EqualTo("override"));
        Assert.That(node.ContainsKey("count"), Is.True);
        Assert.That(node["count"], Is.Null);
    }

    [Test]
    public void AdditionalProperties_DeepMergeNestedObjects()
    {
        var json = JsonUtils.SerializeWithAdditionalProperties(
            new TestBody
            {
                Name = "fern",
                Nested = new Dictionary<string, object?> { ["keep"] = "kept", ["replace"] = "old" },
            },
            new Dictionary<string, object?>
            {
                ["nested"] = new Dictionary<string, object?>
                {
                    ["replace"] = "new",
                    ["added"] = new[] { 1, 2 },
                },
            }
        );

        var nested = JsonNode.Parse(json)!.AsObject()["nested"]!.AsObject();
        Assert.That(nested["keep"]!.GetValue<string>(), Is.EqualTo("kept"));
        Assert.That(nested["replace"]!.GetValue<string>(), Is.EqualTo("new"));
        Assert.That(nested["added"]!.AsArray().Count, Is.EqualTo(2));
    }

    [Test]
    public void AdditionalProperties_NonObjectValueReplacesNestedObject()
    {
        var json = JsonUtils.SerializeWithAdditionalProperties(
            new TestBody
            {
                Name = "fern",
                Nested = new Dictionary<string, object?> { ["keep"] = "kept" },
            },
            new Dictionary<string, object?> { ["nested"] = "flat" }
        );

        var node = JsonNode.Parse(json)!.AsObject();
        Assert.That(node["nested"]!.GetValue<string>(), Is.EqualTo("flat"));
    }

    [Test]
    public void NonObjectBody_WithAdditionalProperties_Throws()
    {
        Assert.Throws<InvalidOperationException>(() =>
            JsonUtils.SerializeWithAdditionalProperties(
                new[] { 1, 2, 3 },
                new Dictionary<string, object?> { ["extra"] = "value" }
            )
        );
    }

    private class TestBody
    {
        [JsonPropertyName("name")]
        public string? Name { get; set; }

        [JsonPropertyName("count")]
        public int? Count { get; set; }

        [JsonPropertyName("nested")]
        public Dictionary<string, object?>? Nested { get; set; }
    }
}
