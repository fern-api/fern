<?php

namespace Seed\Requests;

use Seed\Core\JsonProperty;

class Inlined
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
