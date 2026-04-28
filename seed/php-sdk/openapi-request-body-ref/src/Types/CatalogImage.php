<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class CatalogImage extends JsonSerializableType
{
    /**
     * @var string $id
     */
    #[JsonProperty('id')]
    public string $id;

    /**
     * @var ?string $caption
     */
    #[JsonProperty('caption')]
    public ?string $caption;

    /**
     * @var ?string $url
     */
    #[JsonProperty('url')]
    public ?string $url;

    /**
     * @var ?CreateCatalogImageRequest $createRequest
     */
    #[JsonProperty('create_request')]
    public ?CreateCatalogImageRequest $createRequest;

    /**
     * @param array{
     *   id: string,
     *   caption?: ?string,
     *   url?: ?string,
     *   createRequest?: ?CreateCatalogImageRequest,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->id = $values['id'];
        $this->caption = $values['caption'] ?? null;
        $this->url = $values['url'] ?? null;
        $this->createRequest = $values['createRequest'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
