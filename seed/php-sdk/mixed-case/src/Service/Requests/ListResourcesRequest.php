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
     * @param int $pageLimit
     * @param DateTime $beforeDate
     */
    public function __construct(
        int $pageLimit,
        DateTime $beforeDate,
    ) {
        $this->pageLimit = $pageLimit;
        $this->beforeDate = $beforeDate;
    }
}
