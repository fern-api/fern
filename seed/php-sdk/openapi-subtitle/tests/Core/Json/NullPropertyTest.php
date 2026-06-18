<?php

namespace Seed\Tests\Core\Json;

use PHPUnit\Framework\TestCase;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Json\JsonSerializableType;

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
}
