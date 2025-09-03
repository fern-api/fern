<?php

namespace Seed\Tests\Core\Json;

use DateTime;
use PHPUnit\Framework\TestCase;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Types\ArrayType;
use Seed\Core\Types\Union;

class UnionArray extends JsonSerializableType
{
    /**
     * @var array<int, datetime|string|null> $mixedDates
     */
    #[ArrayType(['integer' => new Union('datetime', 'string', 'null')])]
    #[JsonProperty('mixed_dates')]
    public array $mixedDates;

    /**
     * @param array{
     *   mixedDates: array<int, datetime|string|null>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->mixedDates = $values['mixedDates'];
    }
}

class UnionArrayTest extends TestCase
{
    public function testUnionArray(): void
    {
        $expectedJson = json_encode(
            [
                'mixed_dates' => [
                    1 => '2023-01-01T12:00:00+00:00',
                    2 => null,
                    3 => 'Some String'
                ]
            ],
            JSON_THROW_ON_ERROR
        );

        $object = UnionArray::fromJson($expectedJson);
        $this->assertInstanceOf(DateTime::class, $object->mixedDates[1], 'mixed_dates[1] should be a DateTime instance.');
        $this->assertEquals('2023-01-01 12:00:00', $object->mixedDates[1]->format('Y-m-d H:i:s'), 'mixed_dates[1] should have the correct datetime.');
        $this->assertNull($object->mixedDates[2], 'mixed_dates[2] should be null.');
        $this->assertEquals('Some String', $object->mixedDates[3], 'mixed_dates[3] should be "Some String".');

        $actualJson = $object->toJson();
        $this->assertJsonStringEqualsJsonString($expectedJson, $actualJson, 'Serialized JSON does not match original JSON for mixed_dates.');
    }
}
