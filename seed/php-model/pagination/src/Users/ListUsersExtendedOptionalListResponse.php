<?php

namespace Seed\Users;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class ListUsersExtendedOptionalListResponse extends SerializableType
{
    /**
     * @var int $totalCount The totall number of /users
     */
    #[JsonProperty("total_count")]
    public int $totalCount;

    /**
     * @param int $totalCount The totall number of /users
     */
    public function __construct(
        int $totalCount,
    ) {
        $this->totalCount = $totalCount;
    }
}
