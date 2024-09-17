<?php

namespace Seed\Dummy\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class RegularResponse extends SerializableType
{
    #[JsonProperty("id")]
    /**
     * @var string $id
     */
    public string $id;

    #[JsonProperty("name")]
    /**
     * @var ?string $name
     */
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
