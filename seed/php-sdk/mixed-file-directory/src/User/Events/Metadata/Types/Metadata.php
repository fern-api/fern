<?php

namespace Seed\User\Events\Metadata\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Metadata extends SerializableType
{
    #[JsonProperty("id")]
    /**
     * @var string $id
     */
    public string $id;

    #[JsonProperty("value")]
    /**
     * @var mixed $value
     */
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
