<?php

namespace Seed\Union;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class NamedMetadata extends JsonSerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @var array<string, mixed> $value
     */
    #[JsonProperty('value'), ArrayType(['string' => 'mixed'])]
    public array $value;

    /**
     * @param array{
     *   name: string,
     *   value: array<string, mixed>,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->name = $values['name'];$this->value = $values['value'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
