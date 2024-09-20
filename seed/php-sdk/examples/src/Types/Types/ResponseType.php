<?php

namespace Seed\Types\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class ResponseType extends SerializableType
{
    /**
     * @var mixed $type
     */
    #[JsonProperty("type")]
    public mixed $type;

    /**
     * @param array{
     *   type: mixed,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->type = $values['type'];
    }
}
