<?php

namespace Seed\Tests\Core;

use PHPUnit\Framework\TestCase;
use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class NullPropertyType extends SerializableType
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
     * @param array{
     *   nonNullProperty: string,
     *   nullProperty?: string|null,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->nonNullProperty = $values['nonNullProperty'];
        $this->nullProperty = $values['nullProperty'] ?? null;
    }
}

class NullPropertyTypeTest extends TestCase
{
    public function testNullPropertiesAreOmitted(): void
    {
        $object = new NullPropertyType(["nonNullProperty" => "Test String", "nullProperty" => null]);

        $serializedObject = $object->jsonSerialize();

        $this->assertArrayHasKey('non_null_property', $serializedObject, 'non_null_property should be present in the serialized JSON.');
        $this->assertArrayNotHasKey('null_property', $serializedObject, 'null_property should be omitted from the serialized JSON.');

        $this->assertEquals('Test String', $serializedObject['non_null_property'], 'non_null_property should have the correct value.');
    }
}
