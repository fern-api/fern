<?php

namespace Seed\InlineUsers\InlineUsers\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class NextPage extends JsonSerializableType
{
    /**
     * @var int $page
     */
    #[JsonProperty('page')]
    private int $page;

    /**
     * @var string $startingAfter
     */
    #[JsonProperty('starting_after')]
    private string $startingAfter;

    /**
     * @param array{
     *   page: int,
     *   startingAfter: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->page = $values['page'];$this->startingAfter = $values['startingAfter'];
    }

    /**
     * @return int
     */
    public function getPage(): int {
        return $this->page;}

    /**
     * @param int $value
     */
    public function setPage(int $value): self {
        $this->page = $value;return $this;}

    /**
     * @return string
     */
    public function getStartingAfter(): string {
        return $this->startingAfter;}

    /**
     * @param string $value
     */
    public function setStartingAfter(string $value): self {
        $this->startingAfter = $value;return $this;}

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
