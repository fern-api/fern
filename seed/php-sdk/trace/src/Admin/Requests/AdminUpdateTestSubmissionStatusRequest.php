<?php

namespace Seed\Admin\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\TestSubmissionStatus;

class AdminUpdateTestSubmissionStatusRequest extends JsonSerializableType
{
    /**
     * @var TestSubmissionStatus $body
     */
    public TestSubmissionStatus $body;

    /**
     * @param array{
     *   body: TestSubmissionStatus,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->body = $values['body'];
    }
}
