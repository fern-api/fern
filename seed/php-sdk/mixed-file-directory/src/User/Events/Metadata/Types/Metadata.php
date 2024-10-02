<?php

namespace Seed\User\Events\Metadata\Types;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

class Metadata extends SerializableType
{
    /**
     * @var string $id
     */
    #[JsonProperty('id')]
    public string $id;

    /**
     * @var mixed $value
     */
    #[JsonProperty('value')]
    public mixed $value;

    /**
     * @param array{
     *   id: string,
     *   value: mixed,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->id = $values['id'];
        $this->value = $values['value'];
    }
}
