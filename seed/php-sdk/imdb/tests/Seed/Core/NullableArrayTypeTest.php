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
     * @param array<string|null> $nullableStringArray
     */
    public function __construct(
        #[ArrayType([new Union('string', 'null')])]
        #[JsonProperty('nullable_string_array')]
        public array $nullableStringArray
    ) {
    }
}

class NullableArrayTypeTest extends TestCase
{
    public function testNullableTypesInArrays(): void
    {
        $data = [
            'nullable_string_array' => ['one', null, 'three']
        ];

        $object = NullableArrayType::jsonDeserialize($data);

        $this->assertEquals(['one', null, 'three'], $object->nullableStringArray, 'nullable_string_array should match the original data.');

        $serializedArray = $object->jsonSerialize();

        $this->assertEquals($data, $serializedArray, 'Serialized JSON does not match original JSON for nullable_string_array.');
    }
}
