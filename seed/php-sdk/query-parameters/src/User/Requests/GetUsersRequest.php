<?php

namespace Seed\User\Requests;

use DateTime;

class GetUsersRequest
{
    /**
     * @param int $limit
     * @param string $id
     * @param DateTime $date
     * @param DateTime $deadline
     * @param ?string $optionalString
     * @param ?string[] $filter
     */
    public function __construct(
        public int $limit,
        public string $id,
        public DateTime $date,
        public DateTime $deadline,
        public ?string $optionalString,
        public ?array $filter,
    )
    {
    }
}
