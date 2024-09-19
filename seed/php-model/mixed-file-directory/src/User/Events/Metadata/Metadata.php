<?php

namespace Seed\User\Events\Metadata;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Metadata extends SerializableType
{
    /**
     * @var string $id
     */
    #[JsonProperty("id")]
    public string $id;

    /**
     * @var mixed $value
     */
    #[JsonProperty("value")]
    public mixed $value;

    /**
     * @param string $id
     * @param mixed $value
     */
    public function __construct(
        string $id,
        mixed $value,
    ) {
        $this->id = $id;
        $this->value = $value;
    }
}
