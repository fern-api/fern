<?php

namespace <%= namespace%>;

use PHPUnit\Framework\TestCase;
use <%= coreNamespace%>\SerializableType;
use <%= coreNamespace%>\JsonProperty;

class NullPropertyType extends SerializableType
{
    public function __construct(
        #[JsonProperty('non_null_property')]
        public string  $nonNullProperty,
        #[JsonProperty('null_property')]
        public ?string $nullProperty = null
    ) {
    }
}

class NullPropertyTypeTest extends TestCase
{
    public function testNullPropertiesAreOmitted(): void
    {
        $object = new NullPropertyType('Test String', null);

        $serializedObject = $object->jsonSerialize();

        $this->assertArrayHasKey('non_null_property', $serializedObject, 'non_null_property should be present in the serialized JSON.');
        $this->assertArrayNotHasKey('null_property', $serializedObject, 'null_property should be omitted from the serialized JSON.');

        $this->assertEquals('Test String', $serializedObject['non_null_property'], 'non_null_property should have the correct value.');
    }
}
