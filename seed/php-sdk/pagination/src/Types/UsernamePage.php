<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class UsernamePage extends SerializableType
{
    #[JsonProperty("data"), ArrayType(["string"])]
    /**
     * @var array<string> $data
     */
    public array $data;

    #[JsonProperty("after")]
    /**
     * @var ?string $after
     */
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
