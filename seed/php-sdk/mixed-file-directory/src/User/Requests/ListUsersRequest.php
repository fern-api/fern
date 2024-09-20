<?php

namespace Seed\User\Requests;

class ListUsersRequest
{
    /**
     * @var ?int $limit The maximum number of results to return.
     */
    public ?int $limit;

    /**
     * @param array{
     *   limit?: ?int,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->limit = $values['limit'] ?? null;
    }
}
