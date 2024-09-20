<?php

namespace Seed\Union\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class GetShapeRequest extends SerializableType
{
    /**
     * @var string $id
     */
    #[JsonProperty("id")]
    public string $id;

    /**
     * @param array{
     *   id: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->id = $values['id'];
    }
}
