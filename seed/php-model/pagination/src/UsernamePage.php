<?php

namespace Seed;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class UsernamePage extends SerializableType
{
    /**
     * @var array<string> $data
     */
    #[JsonProperty("data"), ArrayType(["string"])]
    public array $data;

    /**
     * @var ?string $after
     */
    #[JsonProperty("after")]
    public ?string $after;

    /**
     * @param array<string> $data
     * @param ?string $after
     */
    public function __construct(
        array $data,
        ?string $after = null,
    ) {
        $this->data = $data;
        $this->after = $after;
    }
}
