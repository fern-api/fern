<?php

namespace Seed\Dataservice\Requests;

use Seed\Core\JsonProperty;

class DescribeRequest
{
    /**
     * @var mixed $filter
     */
    #[JsonProperty("filter")]
    public mixed $filter;

}
