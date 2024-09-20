<?php

namespace Seed\Tests\Core;

use PHPUnit\Framework\TestCase;
use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Core\Union;

class EmptyArraysType extends SerializableType
{
    /**
     * @var string[] $emptyStringArray
     */
    #[ArrayType(['string'])]
    #[JsonProperty('empty_string_array')]
    public array $emptyStringArray;

    /**
     * @var array<string, string|null> $emptyMapArray
     */
    #[JsonProperty('empty_map_array')]
    #[ArrayType(['integer' => new Union('string', 'null')])]
    public array $emptyMapArray;

    /**
     * @var array<string|null> $emptyDatesArray
     */
    #[ArrayType([new Union('date', 'null')])]
    #[JsonProperty('empty_dates_array')]
    public array $emptyDatesArray;

    /**
     * @param array{
     *   emptyStringArray: string[],
     *   emptyMapArray: array<string, string|null>,
     *   emptyDatesArray: array<string|null>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->emptyStringArray = $values['emptyStringArray'];
        $this->emptyMapArray = $values['emptyMapArray'];
        $this->emptyDatesArray = $values['emptyDatesArray'];
    }
}

class EmptyArraysTest extends TestCase
{
    public function testEmptyArrays(): void
    {
        $data = [
            'empty_string_array' => [],
            'empty_map_array' => [],
            'empty_dates_array' => []
        ];

        $json = json_encode($data, JSON_THROW_ON_ERROR);

        $object = EmptyArraysType::fromJson($json);

        $serializedJson = $object->toJson();

        $this->assertJsonStringEqualsJsonString($json, $serializedJson, 'Serialized JSON does not match original JSON for EmptyArraysType.');

        // Check that arrays are empty
        $this->assertEmpty($object->emptyStringArray, 'empty_string_array should be empty.');
        $this->assertEmpty($object->emptyMapArray, 'empty_map_array should be empty.');
        $this->assertEmpty($object->emptyDatesArray, 'empty_dates_array should be empty.');
    }
}
