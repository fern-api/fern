<?php

namespace Seed\Types;

use DateTime;
use DateTimeInterface;
use ReflectionClass;
use ReflectionProperty;
use Seed\Core\ArrayType;
use Seed\Core\DateType;
use Seed\Core\JsonProperty;
use Seed\Core\SerializableType;

class ExampleType extends SerializableType
{
    public function __construct(
        #[JsonProperty('name')]
        public string $name,

        #[JsonProperty('age')]
        public int $age,

        #[JsonProperty('price')]
        public float $price,

        #[JsonProperty('is_active')]
        public bool $isActive,

        #[DateType(DateType::TYPE_DATE)]
        #[JsonProperty('start_date')]
        public DateTime $startDate,

        #[DateType(DateType::TYPE_DATETIME)]
        #[JsonProperty('created_at')]
        public DateTime $createdAt,

        #[ArrayType(['string'])]
        #[JsonProperty('string_list')]
        /** @var string[] $stringList */
        public array $stringList,

        #[ArrayType(['string' => 'int'])]
        #[JsonProperty('string_int_map')]
        public array $stringIntMap,

        #[ArrayType([['string']])]
        #[JsonProperty('nested_string_list')]
        public array $nestedStringList,

        #[ArrayType(['int' => ['int' => ExampleNestedType::class]])]
        #[JsonProperty('nested_type_map')]
        public array $nestedTypeMap,

        #[JsonProperty('optional_name')]
        public ?string $optionalName = null
    ) {}
}
