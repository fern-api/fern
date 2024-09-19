<?php

namespace Seed\Tests\Core;

use PHPUnit\Framework\TestCase;
use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Core\Union;
use DateTime;

class MixedDateArrayType extends SerializableType
{
    public function __construct(
        #[ArrayType(['integer' => new Union('datetime', 'string', 'null')])]
        #[JsonProperty('mixed_dates')]
        public array $mixedDates
    ) {
    }
}

class MixedDateArrayTypeTest extends TestCase
{
    public function testDateTimeTypesInUnionArrays(): void
    {
        $data = [
            'mixed_dates' => [
                1 => '2023-01-01T12:00:00+00:00',
                2 => null,
                3 => 'Some String'
            ]
        ];

        $json = json_encode($data, JSON_THROW_ON_ERROR);

        $object = MixedDateArrayType::fromJson($json);

        $this->assertInstanceOf(DateTime::class, $object->mixedDates[1], 'mixed_dates[1] should be a DateTime instance.');
        $this->assertEquals('2023-01-01 12:00:00', $object->mixedDates[1]->format('Y-m-d H:i:s'), 'mixed_dates[1] should have the correct datetime.');

        $this->assertNull($object->mixedDates[2], 'mixed_dates[2] should be null.');

        $this->assertEquals('Some String', $object->mixedDates[3], 'mixed_dates[3] should be "Some String".');

        $serializedJson = $object->toJson();

        $this->assertJsonStringEqualsJsonString($json, $serializedJson, 'Serialized JSON does not match original JSON for mixed_dates.');
    }
}
