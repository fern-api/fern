<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Commons\Language;
use Seed\Submission\ExecutionSessionStatus;

class ExecutionSessionResponse extends SerializableType
{
    #[JsonProperty("sessionId")]
    /**
     * @var string $sessionId
     */
    public string $sessionId;

    #[JsonProperty("language")]
    /**
     * @var Language $language
     */
    public Language $language;

    #[JsonProperty("status")]
    /**
     * @var ExecutionSessionStatus $status
     */
    public ExecutionSessionStatus $status;

    #[JsonProperty("executionSessionUrl")]
    /**
     * @var ?string $executionSessionUrl
     */
    public ?string $executionSessionUrl;

    /**
     * @param string $sessionId
     * @param Language $language
     * @param ExecutionSessionStatus $status
     * @param ?string $executionSessionUrl
     */
    public function __construct(
        string $sessionId,
        Language $language,
        ExecutionSessionStatus $status,
        ?string $executionSessionUrl = null,
    ) {
        $this->sessionId = $sessionId;
        $this->language = $language;
        $this->status = $status;
        $this->executionSessionUrl = $executionSessionUrl;
    }
}
