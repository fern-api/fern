<?php

namespace Seed\Catalog\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\CreateCatalogImageRequest;
use Seed\Core\Json\JsonProperty;
use Seed\Utils\File;

class CreateCatalogImageBody extends JsonSerializableType
{
    /**
     * @var CreateCatalogImageRequest $request
     */
    #[JsonProperty('request')]
    public CreateCatalogImageRequest $request;

    /**
     * @var ?File $imageFile
     */
    public ?File $imageFile;

    /**
     * @param array{
     *   request: CreateCatalogImageRequest,
     *   imageFile?: ?File,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->request = $values['request'];
        $this->imageFile = $values['imageFile'] ?? null;
    }
}
