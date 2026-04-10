<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\InlineUsersUserPage;
use Seed\Core\Json\JsonProperty;

class InlineUsersListUsersExtendedResponse extends JsonSerializableType
{
    use InlineUsersUserPage;

    /**
     * @var int $totalCount The totall number of /users
     */
    #[JsonProperty('total_count')]
    public int $totalCount;

    /**
     * @param array{
     *   data: InlineUsersUserListContainer,
     *   totalCount: int,
     *   next?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->data = $values['data'];
        $this->next = $values['next'] ?? null;
        $this->totalCount = $values['totalCount'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
