<?php

namespace Seed\Tests\Core\Json;

use DateTime;
use PHPUnit\Framework\TestCase;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Types\ArrayType;

class DateArray extends JsonSerializableType
{
    /**
     * @var string[] $dates
     */
    #[ArrayType(['date'])]
    #[JsonProperty('dates')]
    public array $dates;

    /**
     * @param array{
     *   dates: string[],
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->dates = $values['dates'];
    }
}

class DateArrayTest extends TestCase
{
    public function testDateTimeInArrays(): void
    {
        $expectedJson = json_encode(
            [
                'dates' => ['2023-01-01', '2023-02-01', '2023-03-01']
            ],
            JSON_THROW_ON_ERROR
        );

        $object = DateArray::fromJson($expectedJson);
        $this->assertInstanceOf(DateTime::class, $object->dates[0], 'dates[0] should be a DateTime instance.');
        $this->assertEquals('2023-01-01', $object->dates[0]->format('Y-m-d'), 'dates[0] should have the correct date.');
        $this->assertInstanceOf(DateTime::class, $object->dates[1], 'dates[1] should be a DateTime instance.');
        $this->assertEquals('2023-02-01', $object->dates[1]->format('Y-m-d'), 'dates[1] should have the correct date.');
        $this->assertInstanceOf(DateTime::class, $object->dates[2], 'dates[2] should be a DateTime instance.');
        $this->assertEquals('2023-03-01', $object->dates[2]->format('Y-m-d'), 'dates[2] should have the correct date.');

        $actualJson = $object->toJson();
        $this->assertJsonStringEqualsJsonString($expectedJson, $actualJson, 'Serialized JSON does not match original JSON for dates array.');
    }
}
