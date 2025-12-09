<?php

namespace Seed\Complex\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class CursorPages extends JsonSerializableType
{
    /**
     * @var ?StartingAfterPaging $next
     */
    #[JsonProperty('next')]
    private ?StartingAfterPaging $next;

    /**
     * @var ?int $page
     */
    #[JsonProperty('page')]
    private ?int $page;

    /**
     * @var ?int $perPage
     */
    #[JsonProperty('per_page')]
    private ?int $perPage;

    /**
     * @var ?int $totalPages
     */
    #[JsonProperty('total_pages')]
    private ?int $totalPages;

    /**
     * @var 'pages' $type
     */
    #[JsonProperty('type')]
    private string $type;

    /**
     * @param array{
     *   type: 'pages',
     *   next?: ?StartingAfterPaging,
     *   page?: ?int,
     *   perPage?: ?int,
     *   totalPages?: ?int,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->next = $values['next'] ?? null;$this->page = $values['page'] ?? null;$this->perPage = $values['perPage'] ?? null;$this->totalPages = $values['totalPages'] ?? null;$this->type = $values['type'];
    }

    /**
     * @return ?StartingAfterPaging
     */
    public function getNext(): ?StartingAfterPaging {
        return $this->next;}

    /**
     * @param ?StartingAfterPaging $value
     */
    public function setNext(?StartingAfterPaging $value = null): self {
        $this->next = $value;return $this;}

    /**
     * @return ?int
     */
    public function getPage(): ?int {
        return $this->page;}

    /**
     * @param ?int $value
     */
    public function setPage(?int $value = null): self {
        $this->page = $value;return $this;}

    /**
     * @return ?int
     */
    public function getPerPage(): ?int {
        return $this->perPage;}

    /**
     * @param ?int $value
     */
    public function setPerPage(?int $value = null): self {
        $this->perPage = $value;return $this;}

    /**
     * @return ?int
     */
    public function getTotalPages(): ?int {
        return $this->totalPages;}

    /**
     * @param ?int $value
     */
    public function setTotalPages(?int $value = null): self {
        $this->totalPages = $value;return $this;}

    /**
     * @return 'pages'
     */
    public function getType(): string {
        return $this->type;}

    /**
     * @param 'pages' $value
     */
    public function setType(string $value): self {
        $this->type = $value;return $this;}

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
