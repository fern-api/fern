<?php

namespace Seed\Ec2\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class BootInstanceRequest extends JsonSerializableType
{
    /**
     * @var string $size
     */
    #[JsonProperty('size')]
    public string $size;

    /**
     * @param array{
     *   size: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->size = $values['size'];
    }
}
