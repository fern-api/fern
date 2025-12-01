<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class RefreshTokenRequest extends JsonSerializableType
{
    /**
     * @var int $ttl
     */
    #[JsonProperty('ttl')]
    public int $ttl;

    /**
     * @param array{
     *   ttl: int,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->ttl = $values['ttl'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
