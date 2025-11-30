<?php

namespace Seed\Users\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Users\Types\Order;

class ListWithOffsetPaginationHasNextPageRequest extends JsonSerializableType
{
    /**
     * @var ?int $page Defaults to first page
     */
    private ?int $page;

    /**
     * The maximum number of elements to return.
     * This is also used as the step size in this
     * paginated endpoint.
     *
     * @var ?int $limit
     */
    private ?int $limit;

    /**
     * @var ?value-of<Order> $order
     */
    private ?string $order;

    /**
     * @param array{
     *   page?: ?int,
     *   limit?: ?int,
     *   order?: ?value-of<Order>,
     * } $values
     */
    public function __construct(
        array $values = [],
    )
    {
        $this->page = $values['page'] ?? null;$this->limit = $values['limit'] ?? null;$this->order = $values['order'] ?? null;
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
    public function getLimit(): ?int {
        return $this->limit;}

    /**
     * @param ?int $value
     */
    public function setLimit(?int $value = null): self {
        $this->limit = $value;return $this;}

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
}
