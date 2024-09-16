<?php

namespace Seed\Types;

use DateTime;
use Seed\Core\ArrayType;
use Seed\Core\DateType;
use Seed\Core\JsonProperty;
use Seed\Core\SerializableType;
use Seed\Core\Union;

class ExampleType extends SerializableType
{
    /**
     * @param string[] $stringList
     * @param array<string, int> $stringIntMap
     * @param string[][] $nestedStringList
     * @param array<int, array<int, ExampleNestedType>> $nestedTypeMap
     * @param WeatherReport $weatherReport
     * @param string|null $optionalName
     */
    public function __construct(
        #[JsonProperty('name')]
        public string   $name,

        #[JsonProperty('age')]
        public int      $age,

        #[JsonProperty('price')]
        public float    $price,

        #[JsonProperty('is_active')]
        public bool     $isActive,

        #[DateType(DateType::TYPE_DATE)]
        #[JsonProperty('start_date')]
        public DateTime $startDate,

        #[DateType(DateType::TYPE_DATETIME)]
        #[JsonProperty('created_at')]
        public DateTime $createdAt,

        #[ArrayType(['string'])]
        #[JsonProperty('string_list')]
        public array    $stringList,

        #[ArrayType(['string' => 'integer'])]
        #[JsonProperty('string_int_map')]
        public array    $stringIntMap,

        #[ArrayType([['string']])]
        #[JsonProperty('nested_string_list')]
        public array    $nestedStringList,

        #[ArrayType(['integer' => ['integer' => new Union("null", "date", ExampleNestedType::class)]])]
        #[JsonProperty('nested_type_map')]
        public array    $nestedTypeMap,

        #[JsonProperty('weather_report')]
        public string   $weatherReport,

        #[JsonProperty('optional_name')]
        public ?string  $optionalName = null
    )
    {
    }
}
