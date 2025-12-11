<?php

namespace Seed\Complex\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class StartingAfterPaging extends JsonSerializableType
{
    /**
     * @var int $perPage
     */
    #[JsonProperty('per_page')]
    private int $perPage;

    /**
     * @var ?string $startingAfter
     */
    #[JsonProperty('starting_after')]
    private ?string $startingAfter;

    /**
     * @param array{
     *   perPage: int,
     *   startingAfter?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->perPage = $values['perPage'];$this->startingAfter = $values['startingAfter'] ?? null;
    }

    /**
     * @return int
     */
    public function getPerPage(): int {
        return $this->perPage;}

    /**
     * @param int $value
     */
    public function setPerPage(int $value): self {
        $this->perPage = $value;return $this;}

    /**
     * @return ?string
     */
    public function getStartingAfter(): ?string {
        return $this->startingAfter;}

    /**
     * @param ?string $value
     */
    public function setStartingAfter(?string $value = null): self {
        $this->startingAfter = $value;return $this;}

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
