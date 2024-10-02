<?php

namespace Seed\Users\Types;

use Seed\Core\Json\SerializableType;
use Seed\Users\Traits\UserOptionalListPage;
use Seed\Core\Json\JsonProperty;

class ListUsersExtendedOptionalListResponse extends SerializableType
{
    use UserOptionalListPage;

    /**
     * @var int $totalCount The totall number of /users
     */
    #[JsonProperty('total_count')]
    public int $totalCount;

    /**
     * @param array{
     *   totalCount: int,
     *   data: UserOptionalListContainer,
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
}
