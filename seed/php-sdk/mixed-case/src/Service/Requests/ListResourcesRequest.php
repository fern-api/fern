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

}
