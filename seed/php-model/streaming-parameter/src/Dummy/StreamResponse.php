<?php

namespace Seed\Dummy;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class StreamResponse extends SerializableType
{
    /**
     * @var string $id
     */
    #[JsonProperty("id")]
    public string $id;

    /**
     * @var ?string $name
     */
    #[JsonProperty("name")]
    public ?string $name;

    /**
     * @param string $id
     * @param ?string $name
     */
    public function __construct(
        string $id,
        ?string $name = null,
    ) {
        $this->id = $id;
        $this->name = $name;
    }
}
