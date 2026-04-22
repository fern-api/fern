using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using NUnit.Framework;
using SeedUnions.Core;

namespace SeedUnions.Test.Core.Json;

[TestFixture]
public class AdditionalPropertiesTests
{
    [Test]
    public void Record_OnDeserialized_ShouldPopulateAdditionalProperties()
    {
        // Arrange
        const string json = """
            {
                "id": "1",
                "category": "fiction",
                "title": "The Hobbit"
            }
            """;

        // Act
        var record = JsonUtils.Deserialize<Record>(json);

        // Assert
        Assert.That(record, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(record.Id, Is.EqualTo("1"));
            Assert.That(record.AdditionalProperties["category"].GetString(), Is.EqualTo("fiction"));
            Assert.That(record.AdditionalProperties["title"].GetString(), Is.EqualTo("The Hobbit"));
        });
    }

    [Test]
    public void RecordWithWriteableAdditionalProperties_OnSerialization_ShouldIncludeAdditionalProperties()
    {
        // Arrange
        var record = new WriteableRecord
        {
            Id = "1",
            AdditionalProperties = { ["category"] = "fiction", ["title"] = "The Hobbit" },
        };

        // Act
        var json = JsonUtils.Serialize(record);
        var deserializedRecord = JsonUtils.Deserialize<WriteableRecord>(json);

        // Assert
        Assert.That(deserializedRecord, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(deserializedRecord.Id, Is.EqualTo("1"));
            Assert.That(
                deserializedRecord.AdditionalProperties["category"],
                Is.InstanceOf<JsonElement>()
            );
            Assert.That(
                ((JsonElement)deserializedRecord.AdditionalProperties["category"]!).GetString(),
                Is.EqualTo("fiction")
            );
            Assert.That(
                deserializedRecord.AdditionalProperties["title"],
                Is.InstanceOf<JsonElement>()
            );
            Assert.That(
                ((JsonElement)deserializedRecord.AdditionalProperties["title"]!).GetString(),
                Is.EqualTo("The Hobbit")
            );
        });
    }

    [Test]
    public void ReadOnlyAdditionalProperties_ShouldRetrieveValuesCorrectly()
    {
        // Arrange
        var extensionData = new Dictionary<string, JsonElement>
        {
            ["key1"] = JsonUtils.SerializeToElement("value1"),
            ["key2"] = JsonUtils.SerializeToElement(123),
        };
        var readOnlyProps = new ReadOnlyAdditionalProperties();
        readOnlyProps.CopyFromExtensionData(extensionData);

        // Act & Assert
        Assert.That(readOnlyProps["key1"].GetString(), Is.EqualTo("value1"));
        Assert.That(readOnlyProps["key2"].GetInt32(), Is.EqualTo(123));
    }

    [Test]
    public void AdditionalProperties_ShouldBehaveAsDictionary()
    {
        // Arrange
        var additionalProps = new AdditionalProperties { ["key1"] = "value1", ["key2"] = 123 };

        // Act
        additionalProps["key3"] = true;

        // Assert
        Assert.Multiple(() =>
        {
            Assert.That(additionalProps["key1"], Is.EqualTo("value1"));
            Assert.That(additionalProps["key2"], Is.EqualTo(123));
            Assert.That((bool)additionalProps["key3"]!, Is.True);
            Assert.That(additionalProps.Count, Is.EqualTo(3));
        });
    }

    [Test]
    public void AdditionalProperties_ToJsonObject_ShouldSerializeCorrectly()
    {
        // Arrange
        var additionalProps = new AdditionalProperties { ["key1"] = "value1", ["key2"] = 123 };

        // Act
        var jsonObject = additionalProps.ToJsonObject();

        Assert.Multiple(() =>
        {
            // Assert
            Assert.That(jsonObject["key1"]!.GetValue<string>(), Is.EqualTo("value1"));
            Assert.That(jsonObject["key2"]!.GetValue<int>(), Is.EqualTo(123));
        });
    }

    [Test]
    public void AdditionalProperties_MixReadAndWrite_ShouldOverwriteDeserializedProperty()
    {
        // Arrange
        const string json = """
            {
                "id": "1",
                "category": "fiction",
                "title": "The Hobbit"
            }
            """;
        var record = JsonUtils.Deserialize<WriteableRecord>(json);

        // Act
        record.AdditionalProperties["category"] = "non-fiction";

        // Assert
        Assert.Multiple(() =>
        {
            Assert.That(record, Is.Not.Null);
            Assert.That(record.Id, Is.EqualTo("1"));
            Assert.That(record.AdditionalProperties["category"], Is.EqualTo("non-fiction"));
            Assert.That(record.AdditionalProperties["title"], Is.InstanceOf<JsonElement>());
            Assert.That(
                ((JsonElement)record.AdditionalProperties["title"]!).GetString(),
                Is.EqualTo("The Hobbit")
            );
        });
    }

    [Test]
    public void RecordWithReadonlyAdditionalPropertiesInts_OnDeserialized_ShouldPopulateAdditionalProperties()
    {
        // Arrange
        const string json = """
            {
                "extra1": 42,
                "extra2": 99
            }
            """;

        // Act
        var record = JsonUtils.Deserialize<RecordWithInts>(json);

        // Assert
        Assert.That(record, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(record.AdditionalProperties["extra1"], Is.EqualTo(42));
            Assert.That(record.AdditionalProperties["extra2"], Is.EqualTo(99));
        });
    }

    [Test]
    public void RecordWithAdditionalPropertiesInts_OnSerialization_ShouldIncludeAdditionalProperties()
    {
        // Arrange
        var record = new WriteableRecordWithInts
        {
            AdditionalProperties = { ["extra1"] = 42, ["extra2"] = 99 },
        };

        // Act
        var json = JsonUtils.Serialize(record);
        var deserializedRecord = JsonUtils.Deserialize<WriteableRecordWithInts>(json);

        // Assert
        Assert.That(deserializedRecord, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(deserializedRecord.AdditionalProperties["extra1"], Is.EqualTo(42));
            Assert.That(deserializedRecord.AdditionalProperties["extra2"], Is.EqualTo(99));
        });
    }

    [Test]
    public void RecordWithReadonlyAdditionalPropertiesDictionaries_OnDeserialized_ShouldPopulateAdditionalProperties()
    {
        // Arrange
        const string json = """
            {
                "extra1": { "key1": true, "key2": false },
                "extra2": { "key3": true }
            }
            """;

        // Act
        var record = JsonUtils.Deserialize<RecordWithDictionaries>(json);

        // Assert
        Assert.That(record, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(record.AdditionalProperties["extra1"]["key1"], Is.True);
            Assert.That(record.AdditionalProperties["extra1"]["key2"], Is.False);
            Assert.That(record.AdditionalProperties["extra2"]["key3"], Is.True);
        });
    }

    [Test]
    public void RecordWithAdditionalPropertiesDictionaries_OnSerialization_ShouldIncludeAdditionalProperties()
    {
        // Arrange
        var record = new WriteableRecordWithDictionaries
        {
            AdditionalProperties =
            {
                ["extra1"] = new Dictionary<string, bool> { { "key1", true }, { "key2", false } },
                ["extra2"] = new Dictionary<string, bool> { { "key3", true } },
            },
        };

        // Act
        var json = JsonUtils.Serialize(record);
        var deserializedRecord = JsonUtils.Deserialize<WriteableRecordWithDictionaries>(json);

        // Assert
        Assert.That(deserializedRecord, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(deserializedRecord.AdditionalProperties["extra1"]["key1"], Is.True);
            Assert.That(deserializedRecord.AdditionalProperties["extra1"]["key2"], Is.False);
            Assert.That(deserializedRecord.AdditionalProperties["extra2"]["key3"], Is.True);
        });
    }

    private record Record : IJsonOnDeserialized
    {
        [JsonPropertyName("id")]
        public required string Id { get; set; }

        [JsonExtensionData]
        private readonly IDictionary<string, JsonElement> _extensionData =
            new Dictionary<string, JsonElement>();

        [JsonIgnore]
        public ReadOnlyAdditionalProperties AdditionalProperties { get; } = new();

        void IJsonOnDeserialized.OnDeserialized()
        {
            AdditionalProperties.CopyFromExtensionData(_extensionData);
        }
    }

    private record WriteableRecord : IJsonOnDeserialized, IJsonOnSerializing
    {
        [JsonPropertyName("id")]
        public required string Id { get; set; }

        [JsonExtensionData]
        private readonly IDictionary<string, object?> _extensionData =
            new Dictionary<string, object?>();

        [JsonIgnore]
        public AdditionalProperties<object?> AdditionalProperties { get; set; } = new();

        void IJsonOnDeserialized.OnDeserialized()
        {
            AdditionalProperties.CopyFromExtensionData(_extensionData);
        }

        void IJsonOnSerializing.OnSerializing()
        {
            AdditionalProperties.CopyToExtensionData(_extensionData);
        }
    }

    private record RecordWithInts : IJsonOnDeserialized
    {
        [JsonExtensionData]
        private readonly IDictionary<string, JsonElement> _extensionData =
            new Dictionary<string, JsonElement>();

        [JsonIgnore]
        public ReadOnlyAdditionalProperties<int> AdditionalProperties { get; } = new();

        void IJsonOnDeserialized.OnDeserialized()
        {
            AdditionalProperties.CopyFromExtensionData(_extensionData);
        }
    }

    private record WriteableRecordWithInts : IJsonOnDeserialized, IJsonOnSerializing
    {
        [JsonExtensionData]
        private readonly IDictionary<string, object?> _extensionData =
            new Dictionary<string, object?>();

        [JsonIgnore]
        public AdditionalProperties<int> AdditionalProperties { get; } = new();

        void IJsonOnDeserialized.OnDeserialized()
        {
            AdditionalProperties.CopyFromExtensionData(_extensionData);
        }

        void IJsonOnSerializing.OnSerializing()
        {
            AdditionalProperties.CopyToExtensionData(_extensionData);
        }
    }

    private record RecordWithDictionaries : IJsonOnDeserialized
    {
        [JsonExtensionData]
        private readonly IDictionary<string, JsonElement> _extensionData =
            new Dictionary<string, JsonElement>();

        [JsonIgnore]
        public ReadOnlyAdditionalProperties<
            Dictionary<string, bool>
        > AdditionalProperties { get; } = new();

        void IJsonOnDeserialized.OnDeserialized()
        {
            AdditionalProperties.CopyFromExtensionData(_extensionData);
        }
    }

    private record WriteableRecordWithDictionaries : IJsonOnDeserialized, IJsonOnSerializing
    {
        [JsonExtensionData]
        private readonly IDictionary<string, object?> _extensionData =
            new Dictionary<string, object?>();

        [JsonIgnore]
        public AdditionalProperties<Dictionary<string, bool>> AdditionalProperties { get; } = new();

        void IJsonOnDeserialized.OnDeserialized()
        {
            AdditionalProperties.CopyFromExtensionData(_extensionData);
        }

        void IJsonOnSerializing.OnSerializing()
        {
            AdditionalProperties.CopyToExtensionData(_extensionData);
        }
    }
}
