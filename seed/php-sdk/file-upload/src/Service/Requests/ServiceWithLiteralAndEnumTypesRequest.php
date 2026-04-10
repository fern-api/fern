<?php

namespace Seed\Service\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Utils\File;
use Seed\Types\ModelType;
use Seed\Core\Json\JsonProperty;
use Seed\Types\OpenEnumType;

class ServiceWithLiteralAndEnumTypesRequest extends JsonSerializableType
{
    /**
     * @var ?File $file
     */
    public ?File $file;

    /**
     * @var ?value-of<ModelType> $modelType
     */
    #[JsonProperty('model_type')]
    public ?string $modelType;

    /**
     * @var ?value-of<OpenEnumType> $openEnum
     */
    #[JsonProperty('open_enum')]
    public ?string $openEnum;

    /**
     * @var ?string $maybeName
     */
    #[JsonProperty('maybe_name')]
    public ?string $maybeName;

    /**
     * @param array{
     *   file?: ?File,
     *   modelType?: ?value-of<ModelType>,
     *   openEnum?: ?value-of<OpenEnumType>,
     *   maybeName?: ?string,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->file = $values['file'] ?? null;
        $this->modelType = $values['modelType'] ?? null;
        $this->openEnum = $values['openEnum'] ?? null;
        $this->maybeName = $values['maybeName'] ?? null;
    }
}
