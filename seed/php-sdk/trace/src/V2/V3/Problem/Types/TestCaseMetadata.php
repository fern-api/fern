<?php

namespace Seed\V2\V3\Problem\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class TestCaseMetadata extends SerializableType
{
    #[JsonProperty("id")]
    /**
     * @var string $id
     */
    public string $id;

    #[JsonProperty("name")]
    /**
     * @var string $name
     */
    public string $name;

    #[JsonProperty("hidden")]
    /**
     * @var bool $hidden
     */
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
