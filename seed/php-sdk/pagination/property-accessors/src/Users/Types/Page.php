<?php

namespace Seed\Users\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class Page extends JsonSerializableType
{
    /**
     * @var int $page The current page
     */
    #[JsonProperty('page')]
    private int $page;

    /**
     * @var ?NextPage $next
     */
    #[JsonProperty('next')]
    private ?NextPage $next;

    /**
     * @var int $perPage
     */
    #[JsonProperty('per_page')]
    private int $perPage;

    /**
     * @var int $totalPage
     */
    #[JsonProperty('total_page')]
    private int $totalPage;

    /**
     * @param array{
     *   page: int,
     *   perPage: int,
     *   totalPage: int,
     *   next?: ?NextPage,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->page = $values['page'];$this->next = $values['next'] ?? null;$this->perPage = $values['perPage'];$this->totalPage = $values['totalPage'];
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
     * @return ?NextPage
     */
    public function getNext(): ?NextPage {
        return $this->next;}

    /**
     * @param ?NextPage $value
     */
    public function setNext(?NextPage $value = null): self {
        $this->next = $value;return $this;}

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
     * @return int
     */
    public function getTotalPage(): int {
        return $this->totalPage;}

    /**
     * @param int $value
     */
    public function setTotalPage(int $value): self {
        $this->totalPage = $value;return $this;}

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
