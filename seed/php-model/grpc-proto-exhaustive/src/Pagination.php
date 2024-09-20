<?php

namespace Seed;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Pagination extends SerializableType
{
    /**
     * @var ?string $next
     */
    #[JsonProperty('next')]
    public ?string $next;

    /**
     * @param array{
     *   next?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->next = $values['next'] ?? null;
    }
}
