<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class UsernamePage extends JsonSerializableType
{
    /**
     * @var ?string $after
     */
    #[JsonProperty('after')]
    public ?string $after;

    /**
     * @var array<string> $data
     */
    #[JsonProperty('data'), ArrayType(['string'])]
    public array $data;

    /**
     * @param array{
     *   data: array<string>,
     *   after?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->after = $values['after'] ?? null;$this->data = $values['data'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
