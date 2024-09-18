<?php

namespace Seed\Ec2\Requests;

use Seed\Core\JsonProperty;

class BootInstanceRequest
{
    /**
     * @var string $size
     */
    #[JsonProperty("size")]
    public string $size;

    /**
     * @param string $size
     */
    public function __construct(
        string $size,
    ) {
        $this->size = $size;
    }
}
