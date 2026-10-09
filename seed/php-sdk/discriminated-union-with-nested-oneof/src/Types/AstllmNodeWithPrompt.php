<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class AstllmNodeWithPrompt extends JsonSerializableType
{
    /**
     * @var value-of<AstllmNodeWithPromptType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @var string $model
     */
    #[JsonProperty('model')]
    public string $model;

    /**
     * @var string $prompt
     */
    #[JsonProperty('prompt')]
    public string $prompt;

    /**
     * @param array{
     *   type: value-of<AstllmNodeWithPromptType>,
     *   model: string,
     *   prompt: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->type = $values['type'];
        $this->model = $values['model'];
        $this->prompt = $values['prompt'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
