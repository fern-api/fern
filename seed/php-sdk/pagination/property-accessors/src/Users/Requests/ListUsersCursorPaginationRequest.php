<?php

namespace Seed\Users\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Users\Types\Order;

class ListUsersCursorPaginationRequest extends JsonSerializableType
{
    /**
     * @var ?int $page Defaults to first page
     */
    private ?int $page;

    /**
     * @var ?int $perPage Defaults to per page
     */
    private ?int $perPage;

    /**
     * @var ?value-of<Order> $order
     */
    private ?string $order;

    /**
     * The cursor used for pagination in order to fetch
     * the next page of results.
     *
     * @var ?string $startingAfter
     */
    private ?string $startingAfter;

    /**
     * @param array{
     *   page?: ?int,
     *   perPage?: ?int,
     *   order?: ?value-of<Order>,
     *   startingAfter?: ?string,
     * } $values
     */
    public function __construct(
        array $values = [],
    )
    {
        $this->page = $values['page'] ?? null;$this->perPage = $values['perPage'] ?? null;$this->order = $values['order'] ?? null;$this->startingAfter = $values['startingAfter'] ?? null;
    }

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
     * @return ?value-of<Order>
     */
    public function getOrder(): ?string {
        return $this->order;}

    /**
     * @param ?value-of<Order> $value
     */
    public function setOrder(?string $value = null): self {
        $this->order = $value;return $this;}

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
}
