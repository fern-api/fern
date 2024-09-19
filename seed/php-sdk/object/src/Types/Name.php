<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Name extends SerializableType
{
    /**
     * @var string $id
     */
    #[JsonProperty("id")]
    public string $id;

    /**
     * @var string $value
     */
    #[JsonProperty("value")]
    public string $value;

    /**
     * @param array{
     *   id: string,
     *   value: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->id = $values['id'];
        $this->value = $values['value'];
    }
}
