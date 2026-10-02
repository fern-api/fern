<?php

namespace Seed\Tests\Core\Json;

use DateTime;
use PHPUnit\Framework\TestCase;
use JsonException;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Types\Date;

class NullProperty extends JsonSerializableType
{
    /**
     * @var string $nonNullProperty
     */
    #[JsonProperty('non_null_property')]
    public string $nonNullProperty;

    /**
     * @var string|null $nullProperty
     */
    #[JsonProperty('null_property')]
    public ?string $nullProperty;

    /**
     * @var DateTime|null $nullDate
     */
    #[JsonProperty('null_date'), Date(Date::TYPE_DATE)]
    public ?DateTime $nullDate;

    /**
     * @var DateTime|null $nullDateTime
     */
    #[JsonProperty('null_datetime'), Date(Date::TYPE_DATETIME)]
    public ?DateTime $nullDateTime;

    /**
     * @param array{
     *   nonNullProperty: string,
     *   nullProperty?: string|null,
     *   nullDate?: DateTime|null,
     *   nullDateTime?: DateTime|null,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->nonNullProperty = $values['nonNullProperty'];
        $this->nullProperty = $values['nullProperty'] ?? null;
        $this->nullDate = $values['nullDate'] ?? null;
        $this->nullDateTime = $values['nullDateTime'] ?? null;
    }
}

class NullPropertyTest extends TestCase
{
    public function testNullPropertiesAreOmitted(): void
    {
        $object = new NullProperty(
            [
                "nonNullProperty" => "Test String",
                "nullProperty" => null
            ]
        );

        $serialized = $object->jsonSerialize();
        $this->assertArrayHasKey('non_null_property', $serialized, 'non_null_property should be present in the serialized JSON.');
        $this->assertArrayNotHasKey('null_property', $serialized, 'null_property should be omitted from the serialized JSON.');
        $this->assertEquals('Test String', $serialized['non_null_property'], 'non_null_property should have the correct value.');
    }

    public function testNullDatePropertiesDeserialize(): void
    {
        $object = NullProperty::fromJson('{"non_null_property": "Test String", "null_date": null, "null_datetime": null}');
        $this->assertEquals('Test String', $object->nonNullProperty);
        $this->assertNull($object->nullDate, 'null_date should deserialize to null.');
        $this->assertNull($object->nullDateTime, 'null_datetime should deserialize to null.');
    }

    public function testMissingDatePropertiesDeserialize(): void
    {
        $object = NullProperty::fromJson('{"non_null_property": "Test String"}');
        $this->assertNull($object->nullDate, 'Omitted null_date should deserialize to null.');
        $this->assertNull($object->nullDateTime, 'Omitted null_datetime should deserialize to null.');
    }

    public function testNonNullDatePropertiesDeserialize(): void
    {
        $object = NullProperty::fromJson('{"non_null_property": "Test String", "null_date": "2023-01-01", "null_datetime": "2023-01-01T12:00:00Z"}');
        $this->assertInstanceOf(DateTime::class, $object->nullDate);
        $this->assertEquals('2023-01-01', $object->nullDate->format('Y-m-d'));
        $this->assertInstanceOf(DateTime::class, $object->nullDateTime);
        $this->assertEquals('2023-01-01T12:00:00+00:00', $object->nullDateTime->format(DateTime::ATOM));
    }

    public function testInvalidDatePropertyThrows(): void
    {
        $this->expectException(JsonException::class);
        NullProperty::fromJson('{"non_null_property": "Test String", "null_datetime": 12345}');
    }
}
