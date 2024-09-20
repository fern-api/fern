<?php

namespace Seed\Users\Types;

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
