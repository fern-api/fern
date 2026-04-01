<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;
use Seed\Core\Types\Union;

class TypeWithOptionalMap extends JsonSerializableType
{
    /**
     * @var string $key
     */
    #[JsonProperty('key')]
    public string $key;

    /**
     * @var array<string, ?string> $columnValues
     */
    #[JsonProperty('columnValues'), ArrayType(['string' => new Union('string', 'null')])]
    public array $columnValues;

    /**
     * @param array{
     *   key: string,
     *   columnValues: array<string, ?string>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->key = $values['key'];
        $this->columnValues = $values['columnValues'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
