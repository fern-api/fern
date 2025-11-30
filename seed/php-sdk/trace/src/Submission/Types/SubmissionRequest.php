<?php

namespace Seed\Submission\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class SubmissionRequest extends JsonSerializableType
{
    /**
     * @var (
     *    'initializeProblemRequest'
     *   |'initializeWorkspaceRequest'
     *   |'submitV2'
     *   |'workspaceSubmit'
     *   |'stop'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    InitializeProblemRequest
     *   |null
     *   |SubmitRequestV2
     *   |WorkspaceSubmitRequest
     *   |StopRequest
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'initializeProblemRequest'
     *   |'initializeWorkspaceRequest'
     *   |'submitV2'
     *   |'workspaceSubmit'
     *   |'stop'
     *   |'_unknown'
     * ),
     *   value: (
     *    InitializeProblemRequest
     *   |null
     *   |SubmitRequestV2
     *   |WorkspaceSubmitRequest
     *   |StopRequest
     *   |mixed
     * ),
     * } $values
     */
    private function __construct(
        array $values,
    )
    {
        $this->type = $values['type'];$this->value = $values['value'];
    }

    /**
     * @param InitializeProblemRequest $initializeProblemRequest
     * @return SubmissionRequest
     */
    public static function initializeProblemRequest(InitializeProblemRequest $initializeProblemRequest): SubmissionRequest {
        return new SubmissionRequest([
            'type' => 'initializeProblemRequest',
            'value' => $initializeProblemRequest,
        ]);
    }

    /**
     * @return SubmissionRequest
     */
    public static function initializeWorkspaceRequest(): SubmissionRequest {
        return new SubmissionRequest([
            'type' => 'initializeWorkspaceRequest',
            'value' => null,
        ]);
    }

    /**
     * @param SubmitRequestV2 $submitV2
     * @return SubmissionRequest
     */
    public static function submitV2(SubmitRequestV2 $submitV2): SubmissionRequest {
        return new SubmissionRequest([
            'type' => 'submitV2',
            'value' => $submitV2,
        ]);
    }

    /**
     * @param WorkspaceSubmitRequest $workspaceSubmit
     * @return SubmissionRequest
     */
    public static function workspaceSubmit(WorkspaceSubmitRequest $workspaceSubmit): SubmissionRequest {
        return new SubmissionRequest([
            'type' => 'workspaceSubmit',
            'value' => $workspaceSubmit,
        ]);
    }

    /**
     * @param StopRequest $stop
     * @return SubmissionRequest
     */
    public static function stop(StopRequest $stop): SubmissionRequest {
        return new SubmissionRequest([
            'type' => 'stop',
            'value' => $stop,
        ]);
    }

    /**
     * @return bool
     */
    public function isInitializeProblemRequest(): bool {
        return $this->value instanceof InitializeProblemRequest&& $this->type === 'initializeProblemRequest';
    }

    /**
     * @return InitializeProblemRequest
     */
    public function asInitializeProblemRequest(): InitializeProblemRequest {
        if (!($this->value instanceof InitializeProblemRequest&& $this->type === 'initializeProblemRequest')){
            throw new Exception(
                "Expected initializeProblemRequest; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isInitializeWorkspaceRequest(): bool {
        return is_null($this->value)&& $this->type === 'initializeWorkspaceRequest';
    }

    /**
     * @return bool
     */
    public function isSubmitV2(): bool {
        return $this->value instanceof SubmitRequestV2&& $this->type === 'submitV2';
    }

    /**
     * @return SubmitRequestV2
     */
    public function asSubmitV2(): SubmitRequestV2 {
        if (!($this->value instanceof SubmitRequestV2&& $this->type === 'submitV2')){
            throw new Exception(
                "Expected submitV2; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isWorkspaceSubmit(): bool {
        return $this->value instanceof WorkspaceSubmitRequest&& $this->type === 'workspaceSubmit';
    }

    /**
     * @return WorkspaceSubmitRequest
     */
    public function asWorkspaceSubmit(): WorkspaceSubmitRequest {
        if (!($this->value instanceof WorkspaceSubmitRequest&& $this->type === 'workspaceSubmit')){
            throw new Exception(
                "Expected workspaceSubmit; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isStop(): bool {
        return $this->value instanceof StopRequest&& $this->type === 'stop';
    }

    /**
     * @return StopRequest
     */
    public function asStop(): StopRequest {
        if (!($this->value instanceof StopRequest&& $this->type === 'stop')){
            throw new Exception(
                "Expected stop; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }

    /**
     * @return array<mixed>
     */
    public function jsonSerialize(): array {
        $result = [];
        $result['type'] = $this->type;
        
        $base = parent::jsonSerialize();
        $result = array_merge($base, $result);
        
        switch ($this->type){
            case 'initializeProblemRequest':
                $value = $this->asInitializeProblemRequest()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'initializeWorkspaceRequest':
                $result['initializeWorkspaceRequest'] = [];
                break;
            case 'submitV2':
                $value = $this->asSubmitV2()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'workspaceSubmit':
                $value = $this->asWorkspaceSubmit()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'stop':
                $value = $this->asStop()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case '_unknown':
            default:
                if (is_null($this->value)){
                    break;
                }
                if ($this->value instanceof JsonSerializableType){
                    $value = $this->value->jsonSerialize();
                    $result = array_merge($value, $result);
                } elseif (is_array($this->value)){
                    $result = array_merge($this->value, $result);
                }
        }
        
        return $result;
    }

    /**
     * @param string $json
     */
    public static function fromJson(string $json): static {
        $decodedJson = JsonDecoder::decode($json);
        if (!is_array($decodedJson)){
            throw new Exception("Unexpected non-array decoded type: " . gettype($decodedJson));
        }
        return self::jsonDeserialize($decodedJson);
    }

    /**
     * @param array<string, mixed> $data
     */
    public static function jsonDeserialize(array $data): static {
        $args = [];
        if (!array_key_exists('type', $data)){
            throw new Exception(
                "JSON data is missing property 'type'",
            );
        }
        $type = $data['type'];
        if (!(is_string($type))){
            throw new Exception(
                "Expected property 'type' in JSON data to be string, instead received " . get_debug_type($data['type']),
            );
        }
        
        $args['type'] = $type;
        switch ($type){
            case 'initializeProblemRequest':
                $args['value'] = InitializeProblemRequest::jsonDeserialize($data);
                break;
            case 'initializeWorkspaceRequest':
                $args['value'] = null;
                break;
            case 'submitV2':
                $args['value'] = SubmitRequestV2::jsonDeserialize($data);
                break;
            case 'workspaceSubmit':
                $args['value'] = WorkspaceSubmitRequest::jsonDeserialize($data);
                break;
            case 'stop':
                $args['value'] = StopRequest::jsonDeserialize($data);
                break;
            case '_unknown':
            default:
                $args['type'] = '_unknown';
                $args['value'] = $data;
        }
        
        // @phpstan-ignore-next-line
        return new static($args);
    }
}
