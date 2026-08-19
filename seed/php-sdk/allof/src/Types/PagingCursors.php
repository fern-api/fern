<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class PagingCursors extends JsonSerializableType
{
    /**
     * @var string $next Cursor for the next page of results.
     */
    #[JsonProperty('next')]
    public string $next;

    /**
     * @var ?string $previous Cursor for the previous page of results.
     */
    #[JsonProperty('previous')]
    public ?string $previous;

    /**
     * @param array{
     *   next: string,
     *   previous?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->next = $values['next'];
        $this->previous = $values['previous'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
