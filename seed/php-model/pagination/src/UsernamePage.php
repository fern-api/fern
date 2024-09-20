<?php

namespace Seed;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class UsernamePage extends SerializableType
{
    /**
     * @var ?string $after
     */
    #[JsonProperty("after")]
    public ?string $after;

    /**
     * @var array<string> $data
     */
    #[JsonProperty("data"), ArrayType(["string"])]
    public array $data;

    /**
     * @param array{
     *   after?: ?string,
     *   data: array<string>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->after = $values['after'] ?? null;
        $this->data = $values['data'];
    }
}
