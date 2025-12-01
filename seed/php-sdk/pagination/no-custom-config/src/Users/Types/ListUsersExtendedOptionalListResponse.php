<?php

namespace Seed\Users\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Users\Traits\UserOptionalListPage;
use Seed\Core\Json\JsonProperty;

class ListUsersExtendedOptionalListResponse extends JsonSerializableType
{
    use UserOptionalListPage;

    /**
     * @var int $totalCount The totall number of /users
     */
    #[JsonProperty('total_count')]
    public int $totalCount;

    /**
     * @param array{
     *   data: UserOptionalListContainer,
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
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
