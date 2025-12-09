<?php

namespace Seed\Users\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class ListUsersPaginationResponse extends JsonSerializableType
{
    /**
     * @var ?bool $hasNextPage
     */
    #[JsonProperty('hasNextPage')]
    private ?bool $hasNextPage;

    /**
     * @var ?Page $page
     */
    #[JsonProperty('page')]
    private ?Page $page;

    /**
     * @var int $totalCount The totall number of /users
     */
    #[JsonProperty('total_count')]
    private int $totalCount;

    /**
     * @var array<User> $data
     */
    #[JsonProperty('data'), ArrayType([User::class])]
    private array $data;

    /**
     * @param array{
     *   totalCount: int,
     *   data: array<User>,
     *   hasNextPage?: ?bool,
     *   page?: ?Page,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->hasNextPage = $values['hasNextPage'] ?? null;$this->page = $values['page'] ?? null;$this->totalCount = $values['totalCount'];$this->data = $values['data'];
    }

    /**
     * @return ?bool
     */
    public function getHasNextPage(): ?bool {
        return $this->hasNextPage;}

    /**
     * @param ?bool $value
     */
    public function setHasNextPage(?bool $value = null): self {
        $this->hasNextPage = $value;return $this;}

    /**
     * @return ?Page
     */
    public function getPage(): ?Page {
        return $this->page;}

    /**
     * @param ?Page $value
     */
    public function setPage(?Page $value = null): self {
        $this->page = $value;return $this;}

    /**
     * @return int
     */
    public function getTotalCount(): int {
        return $this->totalCount;}

    /**
     * @param int $value
     */
    public function setTotalCount(int $value): self {
        $this->totalCount = $value;return $this;}

    /**
     * @return array<User>
     */
    public function getData(): array {
        return $this->data;}

    /**
     * @param array<User> $value
     */
    public function setData(array $value): self {
        $this->data = $value;return $this;}

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
