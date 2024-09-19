<?php

namespace Seed\Service\Requests;

use DateTime;

class ListResourcesRequest
{
    /**
     * @var int $pageLimit
     */
    public int $pageLimit;

    /**
     * @var DateTime $beforeDate
     */
    public DateTime $beforeDate;

    /**
     * @param array{
     *   pageLimit: int,
     *   beforeDate: DateTime,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->pageLimit = $values['pageLimit'];
        $this->beforeDate = $values['beforeDate'];
    }
}
