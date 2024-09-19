<?php

namespace Seed\Service;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class User extends SerializableType
{
    /**
     * @var string $userName
     */
    #[JsonProperty("userName")]
    public string $userName;

    /**
     * @var array<string> $metadataTags
     */
    #[JsonProperty("metadata_tags"), ArrayType(["string"])]
    public array $metadataTags;

    /**
     * @var array<string, string> $extraProperties
     */
    #[JsonProperty("EXTRA_PROPERTIES"), ArrayType(["string" => "string"])]
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
