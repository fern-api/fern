<?php

namespace Seed\Users;

use Seed\Core\Json\JsonSerializableType;
use Seed\Users\Traits\UserPage;
use Seed\Core\Json\JsonProperty;

class ListUsersExtendedResponse extends JsonSerializableType
{
    use UserPage;

    /**
     * @var int $totalCount The totall number of /users
     */
    #[JsonProperty('total_count')]
    public int $totalCount;

    /**
     * @param array{
     *   totalCount: int,
     *   data: UserListContainer,
     *   next?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->totalCount = $values['totalCount'];
        $this->data = $values['data'];
        $this->next = $values['next'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
