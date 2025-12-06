<?php

namespace Seed\Service\Requests;

use Seed\Core\Json\JsonSerializableType;
use DateTime;

class ListResourcesRequest extends JsonSerializableType
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
    )
    {
        $this->pageLimit = $values['pageLimit'];$this->beforeDate = $values['beforeDate'];
    }
}
