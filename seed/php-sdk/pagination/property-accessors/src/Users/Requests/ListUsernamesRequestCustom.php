<?php

namespace Seed\Users\Requests;

use Seed\Core\Json\JsonSerializableType;

class ListUsernamesRequestCustom extends JsonSerializableType
{
    /**
     * The cursor used for pagination in order to fetch
     * the next page of results.
     *
     * @var ?string $startingAfter
     */
    private ?string $startingAfter;

    /**
     * @param array{
     *   startingAfter?: ?string,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->startingAfter = $values['startingAfter'] ?? null;
    }

    /**
     * @return ?string
     */
    public function getStartingAfter(): ?string
    {
        return $this->startingAfter;
    }

    /**
     * @param ?string $value
     */
    public function setStartingAfter(?string $value = null): self
    {
        $this->startingAfter = $value;
        return $this;
    }
}
