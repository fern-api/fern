using System.Text.Json;
using System.Text.Json.Serialization;
using NUnit.Framework;
using OneOf;
using SeedUnions.Core;

namespace SeedUnions.Test.Core.Json;

[TestFixture]
[Parallelizable(ParallelScope.All)]
public class OneOfSerializerTests
{
    private class Foo
    {
        [JsonPropertyName("string_prop")]
        public required string StringProp { get; set; }
    }

    private class Bar
    {
        [JsonPropertyName("int_prop")]
        public required int IntProp { get; set; }
    }

    private static readonly OneOf<string, int, object, Foo, Bar> OneOf1 = OneOf<
        string,
        int,
        object,
        Foo,
        Bar
    >.FromT2(new { });
    private const string OneOf1String = "{}";

    private static readonly OneOf<string, int, object, Foo, Bar> OneOf2 = OneOf<
        string,
        int,
        object,
        Foo,
        Bar
    >.FromT0("test");
    private const string OneOf2String = "\"test\"";

    private static readonly OneOf<string, int, object, Foo, Bar> OneOf3 = OneOf<
        string,
        int,
        object,
        Foo,
        Bar
    >.FromT1(123);
    private const string OneOf3String = "123";

    private static readonly OneOf<string, int, object, Foo, Bar> OneOf4 = OneOf<
        string,
        int,
        object,
        Foo,
        Bar
    >.FromT3(new Foo { StringProp = "test" });
    private const string OneOf4String = "{\"string_prop\": \"test\"}";

    private static readonly OneOf<string, int, object, Foo, Bar> OneOf5 = OneOf<
        string,
        int,
        object,
        Foo,
        Bar
    >.FromT4(new Bar { IntProp = 5 });
    private const string OneOf5String = "{\"int_prop\": 5}";

    [Test]
    public void Serialize_OneOfs_Should_Return_Expected_String()
    {
        (OneOf<string, int, object, Foo, Bar>, string)[] testData =
        [
            (OneOf1, OneOf1String),
            (OneOf2, OneOf2String),
            (OneOf3, OneOf3String),
            (OneOf4, OneOf4String),
            (OneOf5, OneOf5String),
        ];
        Assert.Multiple(() =>
        {
            foreach (var (oneOf, expected) in testData)
            {
                var result = JsonUtils.Serialize(oneOf);
                Assert.That(result, Is.EqualTo(expected).IgnoreWhiteSpace);
            }
        });
    }

    [Test]
    public void OneOfs_Should_Deserialize_From_String()
    {
        (OneOf<string, int, object, Foo, Bar>, string)[] testData =
        [
            (OneOf1, OneOf1String),
            (OneOf2, OneOf2String),
            (OneOf3, OneOf3String),
            (OneOf4, OneOf4String),
            (OneOf5, OneOf5String),
        ];
        Assert.Multiple(() =>
        {
            foreach (var (oneOf, json) in testData)
            {
                var result = JsonUtils.Deserialize<OneOf<string, int, object, Foo, Bar>>(json);
                Assert.That(result.Index, Is.EqualTo(oneOf.Index));
                Assert.That(json, Is.EqualTo(JsonUtils.Serialize(result.Value)).IgnoreWhiteSpace);
            }
        });
    }

    private static readonly OneOf<string, int, object, Foo, Bar>? NullableOneOf1 = null;
    private const string NullableOneOf1String = "null";

    private static readonly OneOf<string, int, object, Foo, Bar>? NullableOneOf2 = OneOf<
        string,
        int,
        object,
        Foo,
        Bar
    >.FromT4(new Bar { IntProp = 5 });
    private const string NullableOneOf2String = "{\"int_prop\": 5}";

    [Test]
    public void Serialize_NullableOneOfs_Should_Return_Expected_String()
    {
        (OneOf<string, int, object, Foo, Bar>?, string)[] testData =
        [
            (NullableOneOf1, NullableOneOf1String),
            (NullableOneOf2, NullableOneOf2String),
        ];
        Assert.Multiple(() =>
        {
            foreach (var (oneOf, expected) in testData)
            {
                var result = JsonUtils.Serialize(oneOf);
                Assert.That(result, Is.EqualTo(expected).IgnoreWhiteSpace);
            }
        });
    }

    [Test]
    public void NullableOneOfs_Should_Deserialize_From_String()
    {
        (OneOf<string, int, object, Foo, Bar>?, string)[] testData =
        [
            (NullableOneOf1, NullableOneOf1String),
            (NullableOneOf2, NullableOneOf2String),
        ];
        Assert.Multiple(() =>
        {
            foreach (var (oneOf, json) in testData)
            {
                var result = JsonUtils.Deserialize<OneOf<string, int, object, Foo, Bar>?>(json);
                Assert.That(result?.Index, Is.EqualTo(oneOf?.Index));
                Assert.That(json, Is.EqualTo(JsonUtils.Serialize(result?.Value)).IgnoreWhiteSpace);
            }
        });
    }

    private static readonly OneOf<string, int, Foo?> OneOfWithNullable1 = OneOf<
        string,
        int,
        Foo?
    >.FromT2(null);
    private const string OneOfWithNullable1String = "null";

    private static readonly OneOf<string, int, Foo?> OneOfWithNullable2 = OneOf<
        string,
        int,
        Foo?
    >.FromT2(new Foo { StringProp = "test" });
    private const string OneOfWithNullable2String = "{\"string_prop\": \"test\"}";

    private static readonly OneOf<string, int, Foo?> OneOfWithNullable3 = OneOf<
        string,
        int,
        Foo?
    >.FromT0("test");
    private const string OneOfWithNullable3String = "\"test\"";

    [Test]
    public void Serialize_OneOfWithNullables_Should_Return_Expected_String()
    {
        (OneOf<string, int, Foo?>, string)[] testData =
        [
            (OneOfWithNullable1, OneOfWithNullable1String),
            (OneOfWithNullable2, OneOfWithNullable2String),
            (OneOfWithNullable3, OneOfWithNullable3String),
        ];
        Assert.Multiple(() =>
        {
            foreach (var (oneOf, expected) in testData)
            {
                var result = JsonUtils.Serialize(oneOf);
                Assert.That(result, Is.EqualTo(expected).IgnoreWhiteSpace);
            }
        });
    }

    [Test]
    public void OneOfWithNullables_Should_Deserialize_From_String()
    {
        (OneOf<string, int, Foo?>, string)[] testData =
        [
            // (OneOfWithNullable1, OneOfWithNullable1String), // not possible with .NET's JSON serializer
            (OneOfWithNullable2, OneOfWithNullable2String),
            (OneOfWithNullable3, OneOfWithNullable3String),
        ];
        Assert.Multiple(() =>
        {
            foreach (var (oneOf, json) in testData)
            {
                var result = JsonUtils.Deserialize<OneOf<string, int, Foo?>>(json);
                Assert.That(result.Index, Is.EqualTo(oneOf.Index));
                Assert.That(json, Is.EqualTo(JsonUtils.Serialize(result.Value)).IgnoreWhiteSpace);
            }
        });
    }

    [Test]
    public void Serialize_OneOfWithObjectLast_Should_Return_Expected_String()
    {
        var oneOfWithObjectLast = OneOf<string, int, Foo, Bar, object>.FromT4(
            new { random = "data" }
        );
        const string oneOfWithObjectLastString = "{\"random\": \"data\"}";

        var result = JsonUtils.Serialize(oneOfWithObjectLast);
        Assert.That(result, Is.EqualTo(oneOfWithObjectLastString).IgnoreWhiteSpace);
    }

    [Test]
    public void OneOfWithObjectLast_Should_Deserialize_From_String()
    {
        const string oneOfWithObjectLastString = "{\"random\": \"data\"}";
        var result = JsonUtils.Deserialize<OneOf<string, int, Foo, Bar, object>>(
            oneOfWithObjectLastString
        );
        Assert.Multiple(() =>
        {
            Assert.That(result.Index, Is.EqualTo(4));
            Assert.That(result.Value, Is.InstanceOf<object>());
            Assert.That(
                JsonUtils.Serialize(result.Value),
                Is.EqualTo(oneOfWithObjectLastString).IgnoreWhiteSpace
            );
        });
    }

    [Test]
    public void Serialize_OneOfWithObjectNotLast_Should_Return_Expected_String()
    {
        var oneOfWithObjectNotLast = OneOf<string, object, int, Foo, Bar>.FromT1(
            new { random = "data" }
        );
        const string oneOfWithObjectNotLastString = "{\"random\": \"data\"}";

        var result = JsonUtils.Serialize(oneOfWithObjectNotLast);
        Assert.That(result, Is.EqualTo(oneOfWithObjectNotLastString).IgnoreWhiteSpace);
    }

    [Test]
    public void OneOfWithObjectNotLast_Should_Deserialize_From_String()
    {
        const string oneOfWithObjectNotLastString = "{\"random\": \"data\"}";
        var result = JsonUtils.Deserialize<OneOf<string, object, int, Foo, Bar>>(
            oneOfWithObjectNotLastString
        );
        Assert.Multiple(() =>
        {
            Assert.That(result.Index, Is.EqualTo(1));
            Assert.That(result.Value, Is.InstanceOf<object>());
            Assert.That(
                JsonUtils.Serialize(result.Value),
                Is.EqualTo(oneOfWithObjectNotLastString).IgnoreWhiteSpace
            );
        });
    }

    [Test]
    public void Serialize_OneOfSingleType_Should_Return_Expected_String()
    {
        var oneOfSingle = OneOf<string>.FromT0("single");
        const string oneOfSingleString = "\"single\"";

        var result = JsonUtils.Serialize(oneOfSingle);
        Assert.That(result, Is.EqualTo(oneOfSingleString));
    }

    [Test]
    public void OneOfSingleType_Should_Deserialize_From_String()
    {
        const string oneOfSingleString = "\"single\"";
        var result = JsonUtils.Deserialize<OneOf<string>>(oneOfSingleString);
        Assert.Multiple(() =>
        {
            Assert.That(result.Index, Is.EqualTo(0));
            Assert.That(result.Value, Is.EqualTo("single"));
        });
    }

    [Test]
    public void Deserialize_InvalidData_Should_Throw_Exception()
    {
        const string invalidJson = "{\"invalid\": \"data\"}";

        Assert.Throws<JsonException>(() =>
        {
            JsonUtils.Deserialize<OneOf<string, int>>(invalidJson);
        });
    }
}
