<?php

namespace Seed\Tests\Core\Json;

use PHPUnit\Framework\TestCase;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Types\ArrayType;
use Seed\Core\Types\Union;

class EmptyArray extends JsonSerializableType
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

class EmptyArrayTest extends TestCase
{
    public function testEmptyArray(): void
    {
        $expectedJson = json_encode(
            [
                'empty_string_array' => [],
                'empty_map_array' => [],
                'empty_dates_array' => []
            ],
            JSON_THROW_ON_ERROR
        );

        $object = EmptyArray::fromJson($expectedJson);
        $this->assertEmpty($object->emptyStringArray, 'empty_string_array should be empty.');
        $this->assertEmpty($object->emptyMapArray, 'empty_map_array should be empty.');
        $this->assertEmpty($object->emptyDatesArray, 'empty_dates_array should be empty.');

        $actualJson = $object->toJson();
        $this->assertJsonStringEqualsJsonString($expectedJson, $actualJson, 'Serialized JSON does not match original JSON for EmptyArraysType.');
    }
}
