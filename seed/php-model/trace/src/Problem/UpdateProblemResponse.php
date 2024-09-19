<?php

namespace Seed\Problem;

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
     * @param int $problemVersion
     */
    public function __construct(
        int $problemVersion,
    ) {
        $this->problemVersion = $problemVersion;
    }
}
