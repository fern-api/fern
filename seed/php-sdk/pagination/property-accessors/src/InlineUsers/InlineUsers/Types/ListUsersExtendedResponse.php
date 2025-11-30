<?php

namespace Seed\InlineUsers\InlineUsers\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\InlineUsers\InlineUsers\Traits\UserPage;
use Seed\Core\Json\JsonProperty;

class ListUsersExtendedResponse extends JsonSerializableType
{
    use UserPage;

    /**
     * @var int $totalCount The totall number of /users
     */
    #[JsonProperty('total_count')]
    private int $totalCount;

    /**
     * @param array{
     *   data: UserListContainer,
     *   totalCount: int,
     *   next?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->data = $values['data'];$this->next = $values['next'] ?? null;$this->totalCount = $values['totalCount'];
    }

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
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
