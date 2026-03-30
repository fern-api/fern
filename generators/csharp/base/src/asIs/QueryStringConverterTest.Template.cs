using NUnit.Framework;
using <%= namespace%>.Core;
using global::System.Collections.Generic;
using global::System.Linq;
using global::System.Runtime.Serialization;
using global::System.Text.Json.Serialization;

namespace <%= namespace%>.Test.Unit;

[TestFixture]
public class QueryStringConverterTest
{
    [Test]
    public void ToDeepObject_WithEnum_ReturnsSimpleKeyValue()
    {
        // Arrange - a simple enum value
        var value = TestEnum.Value1;
        var prefix = "operand";

        // Act
        var result = QueryStringConverter.ToDeepObject(prefix, value);

        // Assert
        var resultList = result.ToList();
        Assert.That(resultList.Count, Is.EqualTo(1), "Should have single parameter");
        Assert.That(resultList[0].Key, Is.EqualTo("operand"));
        Assert.That(resultList[0].Value, Is.EqualTo("value_1"));
    }

    [Test]
    public void ToDeepObject_WithOneOfEnum_ReturnsSimpleKeyValue()
    {
        // Arrange - OneOf with enum value
        var value = OneOf.OneOf<TestStringEnum, TestEnum>.FromT0(TestStringEnum.Red);
        var prefix = "operandOrColor";

        // Act
        var result = QueryStringConverter.ToDeepObject(prefix, value);

        // Assert
        var resultList = result.ToList();
        Assert.That(resultList.Count, Is.EqualTo(1), "Should have single parameter, not array notation");
        Assert.That(resultList[0].Key, Is.EqualTo("operandOrColor"), "Should use simple key, not operandOrColor[0]");
        Assert.That(resultList[0].Value, Is.EqualTo("red"));
    }

    [Test]
    public void ToDeepObject_WithArrayOfEnums_ReturnsIndexedKeyValues()
    {
        // Arrange - array of enum values
        var value = new[] { TestEnum.Value1, TestEnum.Value2 };
        var prefix = "operands";

        // Act
        var result = QueryStringConverter.ToDeepObject(prefix, value);

        // Assert
        var resultList = result.ToList();
        Assert.That(resultList.Count, Is.EqualTo(2));
        Assert.That(resultList[0].Key, Is.EqualTo("operands[0]"));
        Assert.That(resultList[0].Value, Is.EqualTo("value_1"));
        Assert.That(resultList[1].Key, Is.EqualTo("operands[1]"));
        Assert.That(resultList[1].Value, Is.EqualTo("value_2"));
    }

    [Test]
    public void ToDeepObject_WithString_ReturnsSimpleKeyValue()
    {
        // Arrange
        var value = "test-value";
        var prefix = "param";

        // Act
        var result = QueryStringConverter.ToDeepObject(prefix, value);

        // Assert
        var resultList = result.ToList();
        Assert.That(resultList.Count, Is.EqualTo(1));
        Assert.That(resultList[0].Key, Is.EqualTo("param"));
        Assert.That(resultList[0].Value, Is.EqualTo("test-value"));
    }

    [Test]
    public void ToDeepObject_WithNumber_ReturnsSimpleKeyValue()
    {
        // Arrange
        var value = 42;
        var prefix = "count";

        // Act
        var result = QueryStringConverter.ToDeepObject(prefix, value);

        // Assert
        var resultList = result.ToList();
        Assert.That(resultList.Count, Is.EqualTo(1));
        Assert.That(resultList[0].Key, Is.EqualTo("count"));
        Assert.That(resultList[0].Value, Is.EqualTo("42"));
    }

    [Test]
    public void ToDeepObject_WithObject_ReturnsDeepObjectNotation()
    {
        // Arrange
        var value = new TestObject { Name = "John", Age = 30 };
        var prefix = "user";

        // Act
        var result = QueryStringConverter.ToDeepObject(prefix, value);

        // Assert
        var resultList = result.ToList();
        Assert.That(resultList.Count, Is.EqualTo(2));
        Assert.That(resultList.Any(kvp => kvp.Key == "user[Name]" && kvp.Value == "John"), Is.True);
        Assert.That(resultList.Any(kvp => kvp.Key == "user[Age]" && kvp.Value == "30"), Is.True);
    }

    [Test]
    public void ToDeepObject_WithArrayOfObjects_ReturnsDeepObjectNotation()
    {
        // Arrange
        var value = new[]
        {
            new TestObject { Name = "user1", Age = 25 },
            new TestObject { Name = "user2", Age = 30 }
        };
        var prefix = "users";

        // Act
        var result = QueryStringConverter.ToDeepObject(prefix, value);

        // Assert
        var resultList = result.ToList();
        Assert.That(resultList.Count, Is.EqualTo(4));
        Assert.That(resultList.Any(kvp => kvp.Key == "users[0][Name]" && kvp.Value == "user1"), Is.True);
        Assert.That(resultList.Any(kvp => kvp.Key == "users[0][Age]" && kvp.Value == "25"), Is.True);
        Assert.That(resultList.Any(kvp => kvp.Key == "users[1][Name]" && kvp.Value == "user2"), Is.True);
        Assert.That(resultList.Any(kvp => kvp.Key == "users[1][Age]" && kvp.Value == "30"), Is.True);
    }

    // Test helper types - defined inline to avoid dependency on generated types
    [JsonConverter(typeof(TestEnumSerializer))]
    private enum TestEnum
    {
        [EnumMember(Value = "value_1")]
        Value1,

        [EnumMember(Value = "value_2")]
        Value2
    }

    private class TestEnumSerializer : JsonConverter<TestEnum>
    {
        public override TestEnum Read(ref global::System.Text.Json.Utf8JsonReader reader, global::System.Type typeToConvert, JsonSerializerOptions options)
        {
            var stringValue = reader.GetString() ?? throw new global::System.Exception("The JSON value could not be read as a string.");
            return stringValue switch
            {
                "value_1" => TestEnum.Value1,
                "value_2" => TestEnum.Value2,
                _ => default
            };
        }

        public override void Write(global::System.Text.Json.Utf8JsonWriter writer, TestEnum value, JsonSerializerOptions options)
        {
            writer.WriteStringValue(value switch
            {
                TestEnum.Value1 => "value_1",
                TestEnum.Value2 => "value_2",
                _ => throw new global::System.ArgumentOutOfRangeException(nameof(value), value, null)
            });
        }
    }

    [JsonConverter(typeof(TestStringEnum.TestStringEnumSerializer))]
    [global::System.Serializable]
    private readonly record struct TestStringEnum : IStringEnum
    {
        public static readonly TestStringEnum Red = new("red");
        public static readonly TestStringEnum Blue = new("blue");

        public TestStringEnum(string value)
        {
            Value = value;
        }

        public string Value { get; }

        public bool Equals(string? other) => Value.Equals(other);

        public override string ToString() => Value;

        internal class TestStringEnumSerializer : JsonConverter<TestStringEnum>
        {
            public override TestStringEnum Read(ref global::System.Text.Json.Utf8JsonReader reader, global::System.Type typeToConvert, JsonSerializerOptions options)
            {
                var stringValue = reader.GetString() ?? throw new global::System.Exception("The JSON value could not be read as a string.");
                return new TestStringEnum(stringValue);
            }

            public override void Write(global::System.Text.Json.Utf8JsonWriter writer, TestStringEnum value, JsonSerializerOptions options)
            {
                writer.WriteStringValue(value.Value);
            }
        }
    }

    private class TestObject
    {
        public string Name { get; set; } = "";
        public int Age { get; set; }
    }
}
