<?php

namespace Seed\Users;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

class ListUsersExtendedOptionalListResponse extends SerializableType
{
    /**
     * @var int $totalCount The totall number of /users
     */
    #[JsonProperty('total_count')]
    public int $totalCount;

    /**
     * @param array{
     *   totalCount: int,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->totalCount = $values['totalCount'];
    }
}
