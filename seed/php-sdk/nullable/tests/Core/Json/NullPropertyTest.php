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
     * @var string|null $nullPropertyExplicitlySet
     */
    #[JsonProperty('null_property_explicitly_set')]
    public string|null $nullPropertyExplicitlySet;

    /**
     * @var string|null $nullPropertyNotExplicitlySet
     */
    #[JsonProperty('null_property_not_explicitly_set')]
    public string|null $nullPropertyNotExplicitlySet;

    /**
     * @param array{
     *   nonNullProperty: string,
     *   nullPropertyExplicitlySet?: string|null,
     *   nullPropertyNotExplicitlySet?: string|null,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        parent::__construct($values);

        $this->nonNullProperty = $values['nonNullProperty'];
        $this->nullPropertyExplicitlySet = $values['nullPropertyExplicitlySet'] ?? null;
        $this->nullPropertyNotExplicitlySet = $values['nullPropertyNotExplicitlySet'] ?? null;
    }
}

class NullPropertyTest extends TestCase
{
    public function testNullPropertiesAreOmitted(): void
    {
        $object = new NullProperty(
            [
                'nonNullProperty' => 'Test String',
                'nullPropertyExplicitlySet' => null
            ]
        );

        $serialized = $object->jsonSerialize();
        $this->assertArrayHasKey('non_null_property', $serialized, 'non_null_property should be present in the serialized JSON.');
        $this->assertArrayHasKey('null_property_explicitly_set', $serialized, 'null_property should be present in the serialized JSON.');
        $this->assertArrayNotHasKey('null_property_not_explicitly_set', $serialized, 'null_property should be omitted from the serialized JSON.');
        $this->assertEquals('Test String', $serialized['non_null_property'], 'non_null_property should have the correct value.');
        $this->assertEquals(null, $serialized['null_property_explicitly_set'], 'null_property_explicitly_set should have the correct value.');

        $actualJson = $object->toJson();
        $this->assertJsonStringEqualsJsonString('{"non_null_property":"Test String", "null_property_explicitly_set":null}', $actualJson, 'Serialized JSON does not match original JSON for NullPropertyTest.');
    }
}
