<?php

namespace Seed\Problem\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class UpdateProblemResponse extends SerializableType
{
    /**
     * @var int $problemVersion
     */
    #[JsonProperty("problemVersion")]
    public int $problemVersion;

    /**
     * @param array{
     *   problemVersion: int,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->problemVersion = $values['problemVersion'];
    }
}
