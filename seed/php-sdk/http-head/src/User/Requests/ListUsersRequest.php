<?php

namespace Seed\User\Requests;

use Seed\Core\Json\JsonSerializableType;

class ListUsersRequest extends JsonSerializableType
{
    /**
     * @var int $limit
     */
    public int $limit;

    /**
     * @param array{
     *   limit: int,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->limit = $values['limit'];
    }
}
