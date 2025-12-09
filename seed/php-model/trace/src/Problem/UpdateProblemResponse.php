<?php

namespace Seed\Problem;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class UpdateProblemResponse extends JsonSerializableType
{
    /**
     * @var int $problemVersion
     */
    #[JsonProperty('problemVersion')]
    public int $problemVersion;

    /**
     * @param array{
     *   problemVersion: int,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->problemVersion = $values['problemVersion'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
