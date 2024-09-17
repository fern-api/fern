<?php

namespace Seed\Users\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class ListUsersExtendedOptionalListResponse extends SerializableType
{
    #[JsonProperty("total_count")]
    /**
     * @var int $totalCount The totall number of /users
     */
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
