<?php

namespace Seed\Tests\Core;

use PHPUnit\Framework\TestCase;
use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Core\Union;

class UnionArrayType extends SerializableType
{
    /**
     * @param array<integer, string|integer|null> $mixedArray
     */
    public function __construct(
        // Map with int keys and values that can be string, int, or null using Union
        #[ArrayType(['integer' => new Union('string', 'integer', 'null')])]
        #[JsonProperty('mixed_array')]
        public array $mixedArray
    ) {
    }
}

class UnionArrayTypeTest extends TestCase
{
    public function testUnionTypesInArrays(): void
    {
        $data = [
            'mixed_array' => [
                1 => 'one',
                2 => 2,
                3 => null
            ]
        ];

        $json = json_encode($data, JSON_THROW_ON_ERROR);

        $object = UnionArrayType::fromJson($json);

        $this->assertEquals('one', $object->mixedArray[1], 'mixed_array[1] should be "one".');
        $this->assertEquals(2, $object->mixedArray[2], 'mixed_array[2] should be 2.');
        $this->assertNull($object->mixedArray[3], 'mixed_array[3] should be null.');

        $serializedJson = $object->toJson();

        $this->assertJsonStringEqualsJsonString($json, $serializedJson, 'Serialized JSON does not match original JSON for mixed_array.');
    }
}
