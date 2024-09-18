<?php

namespace Seed\V2\V3\Problem\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class TestCaseMetadata extends SerializableType
{
    /**
     * @var string $id
     */
    #[JsonProperty("id")]
    public string $id;

    /**
     * @var string $name
     */
    #[JsonProperty("name")]
    public string $name;

    /**
     * @var bool $hidden
     */
    #[JsonProperty("hidden")]
    public bool $hidden;

    /**
     * @param string $id
     * @param string $name
     * @param bool $hidden
     */
    public function __construct(
        string $id,
        string $name,
        bool $hidden,
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->hidden = $hidden;
    }
}
