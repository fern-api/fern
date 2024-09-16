<?php

namespace Seed\Tests\Core;

use PHPUnit\Framework\TestCase;
use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use DateTime;

class DateArrayType extends SerializableType
{
    /**
     * @param string[] $dates
     */
    public function __construct(
        // Array of dates
        #[ArrayType(['date'])]
        #[JsonProperty('dates')]
        public array $dates
    ) {
    }
}

class DateArrayTypeTest extends TestCase
{
    public function testDateTimeTypesInArrays(): void
    {
        $data = [
            'dates' => ['2023-01-01', '2023-02-01', '2023-03-01']
        ];

        $json = json_encode($data, JSON_THROW_ON_ERROR);

        $object = DateArrayType::fromJson($json);

        $this->assertInstanceOf(DateTime::class, $object->dates[0], 'dates[0] should be a DateTime instance.');
        $this->assertEquals('2023-01-01', $object->dates[0]->format('Y-m-d'), 'dates[0] should have the correct date.');
        $this->assertInstanceOf(DateTime::class, $object->dates[1], 'dates[1] should be a DateTime instance.');
        $this->assertEquals('2023-02-01', $object->dates[1]->format('Y-m-d'), 'dates[1] should have the correct date.');
        $this->assertInstanceOf(DateTime::class, $object->dates[2], 'dates[2] should be a DateTime instance.');
        $this->assertEquals('2023-03-01', $object->dates[2]->format('Y-m-d'), 'dates[2] should have the correct date.');

        $serializedJson = $object->toJson();

        $this->assertJsonStringEqualsJsonString($json, $serializedJson, 'Serialized JSON does not match original JSON for dates array.');
    }
}
