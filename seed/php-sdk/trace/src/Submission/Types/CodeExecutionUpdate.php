<?php

namespace Seed\Submission\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class CodeExecutionUpdate extends JsonSerializableType
{
    /**
     * @var (
     *    'buildingExecutor'
     *   |'running'
     *   |'errored'
     *   |'stopped'
     *   |'graded'
     *   |'gradedV2'
     *   |'workspaceRan'
     *   |'recording'
     *   |'recorded'
     *   |'invalidRequest'
     *   |'finished'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    BuildingExecutorResponse
     *   |RunningResponse
     *   |ErroredResponse
     *   |StoppedResponse
     *   |GradedResponse
     *   |GradedResponseV2
     *   |WorkspaceRanResponse
     *   |RecordingResponseNotification
     *   |RecordedResponseNotification
     *   |InvalidRequestResponse
     *   |FinishedResponse
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'buildingExecutor'
     *   |'running'
     *   |'errored'
     *   |'stopped'
     *   |'graded'
     *   |'gradedV2'
     *   |'workspaceRan'
     *   |'recording'
     *   |'recorded'
     *   |'invalidRequest'
     *   |'finished'
     *   |'_unknown'
     * ),
     *   value: (
     *    BuildingExecutorResponse
     *   |RunningResponse
     *   |ErroredResponse
     *   |StoppedResponse
     *   |GradedResponse
     *   |GradedResponseV2
     *   |WorkspaceRanResponse
     *   |RecordingResponseNotification
     *   |RecordedResponseNotification
     *   |InvalidRequestResponse
     *   |FinishedResponse
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
     * @param BuildingExecutorResponse $buildingExecutor
     * @return CodeExecutionUpdate
     */
    public static function buildingExecutor(BuildingExecutorResponse $buildingExecutor): CodeExecutionUpdate {
        return new CodeExecutionUpdate([
            'type' => 'buildingExecutor',
            'value' => $buildingExecutor,
        ]);
    }

    /**
     * @param RunningResponse $running
     * @return CodeExecutionUpdate
     */
    public static function running(RunningResponse $running): CodeExecutionUpdate {
        return new CodeExecutionUpdate([
            'type' => 'running',
            'value' => $running,
        ]);
    }

    /**
     * @param ErroredResponse $errored
     * @return CodeExecutionUpdate
     */
    public static function errored(ErroredResponse $errored): CodeExecutionUpdate {
        return new CodeExecutionUpdate([
            'type' => 'errored',
            'value' => $errored,
        ]);
    }

    /**
     * @param StoppedResponse $stopped
     * @return CodeExecutionUpdate
     */
    public static function stopped(StoppedResponse $stopped): CodeExecutionUpdate {
        return new CodeExecutionUpdate([
            'type' => 'stopped',
            'value' => $stopped,
        ]);
    }

    /**
     * @param GradedResponse $graded
     * @return CodeExecutionUpdate
     */
    public static function graded(GradedResponse $graded): CodeExecutionUpdate {
        return new CodeExecutionUpdate([
            'type' => 'graded',
            'value' => $graded,
        ]);
    }

    /**
     * @param GradedResponseV2 $gradedV2
     * @return CodeExecutionUpdate
     */
    public static function gradedV2(GradedResponseV2 $gradedV2): CodeExecutionUpdate {
        return new CodeExecutionUpdate([
            'type' => 'gradedV2',
            'value' => $gradedV2,
        ]);
    }

    /**
     * @param WorkspaceRanResponse $workspaceRan
     * @return CodeExecutionUpdate
     */
    public static function workspaceRan(WorkspaceRanResponse $workspaceRan): CodeExecutionUpdate {
        return new CodeExecutionUpdate([
            'type' => 'workspaceRan',
            'value' => $workspaceRan,
        ]);
    }

    /**
     * @param RecordingResponseNotification $recording
     * @return CodeExecutionUpdate
     */
    public static function recording(RecordingResponseNotification $recording): CodeExecutionUpdate {
        return new CodeExecutionUpdate([
            'type' => 'recording',
            'value' => $recording,
        ]);
    }

    /**
     * @param RecordedResponseNotification $recorded
     * @return CodeExecutionUpdate
     */
    public static function recorded(RecordedResponseNotification $recorded): CodeExecutionUpdate {
        return new CodeExecutionUpdate([
            'type' => 'recorded',
            'value' => $recorded,
        ]);
    }

    /**
     * @param InvalidRequestResponse $invalidRequest
     * @return CodeExecutionUpdate
     */
    public static function invalidRequest(InvalidRequestResponse $invalidRequest): CodeExecutionUpdate {
        return new CodeExecutionUpdate([
            'type' => 'invalidRequest',
            'value' => $invalidRequest,
        ]);
    }

    /**
     * @param FinishedResponse $finished
     * @return CodeExecutionUpdate
     */
    public static function finished(FinishedResponse $finished): CodeExecutionUpdate {
        return new CodeExecutionUpdate([
            'type' => 'finished',
            'value' => $finished,
        ]);
    }

    /**
     * @return bool
     */
    public function isBuildingExecutor(): bool {
        return $this->value instanceof BuildingExecutorResponse&& $this->type === 'buildingExecutor';
    }

    /**
     * @return BuildingExecutorResponse
     */
    public function asBuildingExecutor(): BuildingExecutorResponse {
        if (!($this->value instanceof BuildingExecutorResponse&& $this->type === 'buildingExecutor')){
            throw new Exception(
                "Expected buildingExecutor; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isRunning(): bool {
        return $this->value instanceof RunningResponse&& $this->type === 'running';
    }

    /**
     * @return RunningResponse
     */
    public function asRunning(): RunningResponse {
        if (!($this->value instanceof RunningResponse&& $this->type === 'running')){
            throw new Exception(
                "Expected running; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isErrored(): bool {
        return $this->value instanceof ErroredResponse&& $this->type === 'errored';
    }

    /**
     * @return ErroredResponse
     */
    public function asErrored(): ErroredResponse {
        if (!($this->value instanceof ErroredResponse&& $this->type === 'errored')){
            throw new Exception(
                "Expected errored; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isStopped(): bool {
        return $this->value instanceof StoppedResponse&& $this->type === 'stopped';
    }

    /**
     * @return StoppedResponse
     */
    public function asStopped(): StoppedResponse {
        if (!($this->value instanceof StoppedResponse&& $this->type === 'stopped')){
            throw new Exception(
                "Expected stopped; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isGraded(): bool {
        return $this->value instanceof GradedResponse&& $this->type === 'graded';
    }

    /**
     * @return GradedResponse
     */
    public function asGraded(): GradedResponse {
        if (!($this->value instanceof GradedResponse&& $this->type === 'graded')){
            throw new Exception(
                "Expected graded; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isGradedV2(): bool {
        return $this->value instanceof GradedResponseV2&& $this->type === 'gradedV2';
    }

    /**
     * @return GradedResponseV2
     */
    public function asGradedV2(): GradedResponseV2 {
        if (!($this->value instanceof GradedResponseV2&& $this->type === 'gradedV2')){
            throw new Exception(
                "Expected gradedV2; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isWorkspaceRan(): bool {
        return $this->value instanceof WorkspaceRanResponse&& $this->type === 'workspaceRan';
    }

    /**
     * @return WorkspaceRanResponse
     */
    public function asWorkspaceRan(): WorkspaceRanResponse {
        if (!($this->value instanceof WorkspaceRanResponse&& $this->type === 'workspaceRan')){
            throw new Exception(
                "Expected workspaceRan; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isRecording(): bool {
        return $this->value instanceof RecordingResponseNotification&& $this->type === 'recording';
    }

    /**
     * @return RecordingResponseNotification
     */
    public function asRecording(): RecordingResponseNotification {
        if (!($this->value instanceof RecordingResponseNotification&& $this->type === 'recording')){
            throw new Exception(
                "Expected recording; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isRecorded(): bool {
        return $this->value instanceof RecordedResponseNotification&& $this->type === 'recorded';
    }

    /**
     * @return RecordedResponseNotification
     */
    public function asRecorded(): RecordedResponseNotification {
        if (!($this->value instanceof RecordedResponseNotification&& $this->type === 'recorded')){
            throw new Exception(
                "Expected recorded; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isInvalidRequest(): bool {
        return $this->value instanceof InvalidRequestResponse&& $this->type === 'invalidRequest';
    }

    /**
     * @return InvalidRequestResponse
     */
    public function asInvalidRequest(): InvalidRequestResponse {
        if (!($this->value instanceof InvalidRequestResponse&& $this->type === 'invalidRequest')){
            throw new Exception(
                "Expected invalidRequest; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isFinished(): bool {
        return $this->value instanceof FinishedResponse&& $this->type === 'finished';
    }

    /**
     * @return FinishedResponse
     */
    public function asFinished(): FinishedResponse {
        if (!($this->value instanceof FinishedResponse&& $this->type === 'finished')){
            throw new Exception(
                "Expected finished; got " . $this->type . " with value of type " . get_debug_type($this->value),
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
            case 'buildingExecutor':
                $value = $this->asBuildingExecutor()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'running':
                $value = $this->asRunning()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'errored':
                $value = $this->asErrored()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'stopped':
                $value = $this->asStopped()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'graded':
                $value = $this->asGraded()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'gradedV2':
                $value = $this->asGradedV2()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'workspaceRan':
                $value = $this->asWorkspaceRan()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'recording':
                $value = $this->asRecording()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'recorded':
                $value = $this->asRecorded()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'invalidRequest':
                $value = $this->asInvalidRequest()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'finished':
                $value = $this->asFinished()->jsonSerialize();
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
            case 'buildingExecutor':
                $args['value'] = BuildingExecutorResponse::jsonDeserialize($data);
                break;
            case 'running':
                $args['value'] = RunningResponse::jsonDeserialize($data);
                break;
            case 'errored':
                $args['value'] = ErroredResponse::jsonDeserialize($data);
                break;
            case 'stopped':
                $args['value'] = StoppedResponse::jsonDeserialize($data);
                break;
            case 'graded':
                $args['value'] = GradedResponse::jsonDeserialize($data);
                break;
            case 'gradedV2':
                $args['value'] = GradedResponseV2::jsonDeserialize($data);
                break;
            case 'workspaceRan':
                $args['value'] = WorkspaceRanResponse::jsonDeserialize($data);
                break;
            case 'recording':
                $args['value'] = RecordingResponseNotification::jsonDeserialize($data);
                break;
            case 'recorded':
                $args['value'] = RecordedResponseNotification::jsonDeserialize($data);
                break;
            case 'invalidRequest':
                $args['value'] = InvalidRequestResponse::jsonDeserialize($data);
                break;
            case 'finished':
                $args['value'] = FinishedResponse::jsonDeserialize($data);
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
