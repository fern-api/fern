<?php

namespace Seed\Service\Requests;

use Seed\Core\SerializableType;
use DateTime;

class ListResourcesRequest extends SerializableType
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
