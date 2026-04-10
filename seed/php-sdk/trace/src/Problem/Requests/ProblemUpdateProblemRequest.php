<?php

namespace Seed\Problem\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\CreateProblemRequest;

class ProblemUpdateProblemRequest extends JsonSerializableType
{
    /**
     * @var CreateProblemRequest $body
     */
    public CreateProblemRequest $body;

    /**
     * @param array{
     *   body: CreateProblemRequest,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->body = $values['body'];
    }
}
