<?php

namespace Seed\Core\SerializableType;

use PHPUnit\Framework\TestCase;
use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class NullPropertyType extends SerializableType
{
    public function __construct(
        #[JsonProperty('non_null_property')]
        public string  $nonNullProperty,

        #[JsonProperty('null_property')]
        public ?string $nullProperty = null
    )
    {
    }
}

class NullPropertyTypeTest extends TestCase
{
    public function testNullPropertiesAreOmitted(): void
    {
        $object = new NullPropertyType('Test String', null);

        $json = $object->toJson();

        $data = json_decode($json, true, JSON_THROW_ON_ERROR);

        $this->assertArrayHasKey('non_null_property', $data, 'non_null_property should be present in the serialized JSON.');
        $this->assertArrayNotHasKey('null_property', $data, 'null_property should be omitted from the serialized JSON.');

        $this->assertEquals('Test String', $data['non_null_property'], 'non_null_property should have the correct value.');
    }
}