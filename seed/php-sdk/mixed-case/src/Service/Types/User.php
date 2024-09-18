<?php

namespace Seed\Service\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class User extends SerializableType
{
    #[JsonProperty("userName")]
    /**
     * @var string $userName
     */
    public string $userName;

    #[JsonProperty("metadata_tags"), ArrayType(["string"])]
    /**
     * @var array<string> $metadataTags
     */
    public array $metadataTags;

    #[JsonProperty("EXTRA_PROPERTIES"), ArrayType(["string" => "string"])]
    /**
     * @var array<string, string> $extraProperties
     */
    public array $extraProperties;

    /**
     * @param string $userName
     * @param array<string> $metadataTags
     * @param array<string, string> $extraProperties
     */
    public function __construct(
        string $userName,
        array $metadataTags,
        array $extraProperties,
    ) {
        $this->userName = $userName;
        $this->metadataTags = $metadataTags;
        $this->extraProperties = $extraProperties;
    }
}
