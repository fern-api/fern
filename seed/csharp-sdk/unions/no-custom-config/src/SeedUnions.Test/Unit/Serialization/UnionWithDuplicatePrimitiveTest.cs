using global::System.Text.Json;
using NUnit.Framework;
using SeedUnions;
using SeedUnions.Core;
using SeedUnions.Test.Utils;

namespace SeedUnions.Test;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class UnionWithDuplicatePrimitiveTest
{
    [NUnit.Framework.Test]
    public void TestDeserialization_1()
    {
        var json = """
            {
              "type": "integer1",
              "value": 9
            }
            """;
        var expectedObject = new UnionWithDuplicatePrimitive(
            new UnionWithDuplicatePrimitive.Integer1(9)
        );
        var deserializedObject = JsonUtils.Deserialize<UnionWithDuplicatePrimitive>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_1()
    {
        var inputJson = """
            {
              "type": "integer1",
              "value": 9
            }
            """;
        JsonAssert.Roundtrips<UnionWithDuplicatePrimitive>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestModelBinding_1()
    {
        var json = """
            {
              "type": "integer1",
              "value": 9
            }
            """;
        var options = new global::System.Text.Json.JsonSerializerOptions(
            global::System.Text.Json.JsonSerializerDefaults.Web
        );
        var deserializedObject = JsonSerializer.Deserialize<UnionWithDuplicatePrimitive>(
            json,
            options
        );
        JsonAssert.AreEqual(deserializedObject!, json);
    }

    [NUnit.Framework.Test]
    public void TestDeserialization_2()
    {
        var json = """
            {
              "type": "integer2",
              "value": 5
            }
            """;
        var expectedObject = new UnionWithDuplicatePrimitive(
            new UnionWithDuplicatePrimitive.Integer2(5)
        );
        var deserializedObject = JsonUtils.Deserialize<UnionWithDuplicatePrimitive>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_2()
    {
        var inputJson = """
            {
              "type": "integer2",
              "value": 5
            }
            """;
        JsonAssert.Roundtrips<UnionWithDuplicatePrimitive>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestModelBinding_2()
    {
        var json = """
            {
              "type": "integer2",
              "value": 5
            }
            """;
        var options = new global::System.Text.Json.JsonSerializerOptions(
            global::System.Text.Json.JsonSerializerDefaults.Web
        );
        var deserializedObject = JsonSerializer.Deserialize<UnionWithDuplicatePrimitive>(
            json,
            options
        );
        JsonAssert.AreEqual(deserializedObject!, json);
    }

    [NUnit.Framework.Test]
    public void TestDeserialization_3()
    {
        var json = """
            {
              "type": "string1",
              "value": "bar1"
            }
            """;
        var expectedObject = new UnionWithDuplicatePrimitive(
            new UnionWithDuplicatePrimitive.String1("bar1")
        );
        var deserializedObject = JsonUtils.Deserialize<UnionWithDuplicatePrimitive>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_3()
    {
        var inputJson = """
            {
              "type": "string1",
              "value": "bar1"
            }
            """;
        JsonAssert.Roundtrips<UnionWithDuplicatePrimitive>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestModelBinding_3()
    {
        var json = """
            {
              "type": "string1",
              "value": "bar1"
            }
            """;
        var options = new global::System.Text.Json.JsonSerializerOptions(
            global::System.Text.Json.JsonSerializerDefaults.Web
        );
        var deserializedObject = JsonSerializer.Deserialize<UnionWithDuplicatePrimitive>(
            json,
            options
        );
        JsonAssert.AreEqual(deserializedObject!, json);
    }

    [NUnit.Framework.Test]
    public void TestDeserialization_4()
    {
        var json = """
            {
              "type": "string1",
              "value": "bar2"
            }
            """;
        var expectedObject = new UnionWithDuplicatePrimitive(
            new UnionWithDuplicatePrimitive.String1("bar2")
        );
        var deserializedObject = JsonUtils.Deserialize<UnionWithDuplicatePrimitive>(json);
        Assert.That(deserializedObject, Is.EqualTo(expectedObject).UsingDefaults());
    }

    [NUnit.Framework.Test]
    public void TestSerialization_4()
    {
        var inputJson = """
            {
              "type": "string1",
              "value": "bar2"
            }
            """;
        JsonAssert.Roundtrips<UnionWithDuplicatePrimitive>(inputJson);
    }

    [NUnit.Framework.Test]
    public void TestModelBinding_4()
    {
        var json = """
            {
              "type": "string1",
              "value": "bar2"
            }
            """;
        var options = new global::System.Text.Json.JsonSerializerOptions(
            global::System.Text.Json.JsonSerializerDefaults.Web
        );
        var deserializedObject = JsonSerializer.Deserialize<UnionWithDuplicatePrimitive>(
            json,
            options
        );
        JsonAssert.AreEqual(deserializedObject!, json);
    }
}
