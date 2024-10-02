<?php

namespace <%= namespace%>;

use <%= coreNamespace%>\Json\SerializableType;
use <%= coreNamespace%>\Json\JsonProperty;
use PHPUnit\Framework\TestCase;

trait IntegerPropertyTrait
{
    /**
     * @var int $integerProperty
     */
    #[JsonProperty('integer_property')]
    public int $integerProperty;
}

class TypeWithTrait extends SerializableType
{
    use IntegerPropertyTrait;

    /**
     * @var string $stringProperty
     */
    #[JsonProperty('string_property')]
    public string $stringProperty;

    /**
     * @param array{
     *   integerProperty: int,
     *   stringProperty: string,
     * } $values
     */
    public function __construct(array $values)
    {
        $this->integerProperty = $values['integerProperty'];
        $this->stringProperty = $values['stringProperty'];
    }
}

class TraitTest extends TestCase
{
    public function testTraitPropertyAndString(): void
    {
        $data = [
            'integer_property' => 42,
            'string_property' => 'Hello, World!',
        ];

        $json = json_encode($data, JSON_THROW_ON_ERROR);

        $object = TypeWithTrait::fromJson($json);

        $serializedJson = $object->toJson();

        $this->assertJsonStringEqualsJsonString($json, $serializedJson, 'Serialized JSON does not match original JSON for ScalarTypesTestWithTrait.');

        $this->assertEquals(42, $object->integerProperty, 'integer_property should be 42.');
        $this->assertEquals('Hello, World!', $object->stringProperty, 'string_property should be "Hello, World!".');
    }
}