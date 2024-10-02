<?php

namespace Seed\Requests;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

class Inlined extends SerializableType
{
    /**
     * @var string $unique
     */
    #[JsonProperty('unique')]
    public string $unique;

    /**
     * @param array{
     *   unique: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->unique = $values['unique'];
    }
}
