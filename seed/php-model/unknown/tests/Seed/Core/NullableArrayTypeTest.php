<?php

namespace Seed\Tests\Core;

use PHPUnit\Framework\TestCase;
use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Core\Union;

class NullableArrayType extends SerializableType
{
    /**
     * @var array<string|null> $nullableStringArray
     */
    #[ArrayType([new Union('string', 'null')])]
    #[JsonProperty('nullable_string_array')]
    public array $nullableStringArray;

    /**
     * @param array{
     *   nullableStringArray: array<string|null>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->nullableStringArray = $values['nullableStringArray'];
    }
}

class NullableArrayTypeTest extends TestCase
{
    public function testNullableTypesInArrays(): void
    {
        $data = [
            'nullable_string_array' => ['one', null, 'three']
        ];

        $json = json_encode($data, JSON_THROW_ON_ERROR);

        $object = NullableArrayType::fromJson($json);

        $this->assertEquals(['one', null, 'three'], $object->nullableStringArray, 'nullable_string_array should match the original data.');

        $serializedJson = $object->toJson();

        $this->assertJsonStringEqualsJsonString($json, $serializedJson, 'Serialized JSON does not match original JSON for nullable_string_array.');
    }
}
