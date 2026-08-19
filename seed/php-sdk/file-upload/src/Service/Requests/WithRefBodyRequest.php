<?php

namespace Seed\Service\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Utils\File;
use Seed\Service\Types\MyObject;
use Seed\Core\Json\JsonProperty;

class WithRefBodyRequest extends JsonSerializableType
{
    /**
     * @var ?File $imageFile
     */
    public ?File $imageFile;

    /**
     * @var MyObject $request
     */
    #[JsonProperty('request')]
    public MyObject $request;

    /**
     * @param array{
     *   request: MyObject,
     *   imageFile?: ?File,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->imageFile = $values['imageFile'] ?? null;
        $this->request = $values['request'];
    }
}
