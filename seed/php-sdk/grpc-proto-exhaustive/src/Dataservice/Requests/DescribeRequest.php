<?php

namespace Seed\Dataservice\Requests;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class DescribeRequest extends SerializableType
{
    /**
     * @var mixed $filter
     */
    #[JsonProperty('filter')]
    public mixed $filter;

    /**
     * @param array{
     *   filter: mixed,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->filter = $values['filter'];
    }
}
