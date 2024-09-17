<?php

namespace Seed;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class parent extends SerializableType
{
    #[JsonProperty("parent")]
    /**
     * @var string $parent_
     */
    public string $parent_;

    /**
     * @param string $parent_
     */
    public function __construct(
        string $parent_,
    ) {
        $this->parent_ = $parent_;
    }
}
