<?php

namespace Seed\InlineUsers\InlineUsers\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\InlineUsers\InlineUsers\Types\Order;

class ListUsersDoubleOffsetPaginationRequest extends JsonSerializableType
{
    /**
     * @var ?float $page Defaults to first page
     */
    private ?float $page;

    /**
     * @var ?float $perPage Defaults to per page
     */
    private ?float $perPage;

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
     *   page?: ?float,
     *   perPage?: ?float,
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
     * @return ?float
     */
    public function getPage(): ?float {
        return $this->page;}

    /**
     * @param ?float $value
     */
    public function setPage(?float $value = null): self {
        $this->page = $value;return $this;}

    /**
     * @return ?float
     */
    public function getPerPage(): ?float {
        return $this->perPage;}

    /**
     * @param ?float $value
     */
    public function setPerPage(?float $value = null): self {
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
