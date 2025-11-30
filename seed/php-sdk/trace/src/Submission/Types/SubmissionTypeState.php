<?php

namespace Seed\Submission\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class SubmissionTypeState extends JsonSerializableType
{
    /**
     * @var (
     *    'test'
     *   |'workspace'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    TestSubmissionState
     *   |WorkspaceSubmissionState
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'test'
     *   |'workspace'
     *   |'_unknown'
     * ),
     *   value: (
     *    TestSubmissionState
     *   |WorkspaceSubmissionState
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
     * @param TestSubmissionState $test
     * @return SubmissionTypeState
     */
    public static function test(TestSubmissionState $test): SubmissionTypeState {
        return new SubmissionTypeState([
            'type' => 'test',
            'value' => $test,
        ]);
    }

    /**
     * @param WorkspaceSubmissionState $workspace
     * @return SubmissionTypeState
     */
    public static function workspace(WorkspaceSubmissionState $workspace): SubmissionTypeState {
        return new SubmissionTypeState([
            'type' => 'workspace',
            'value' => $workspace,
        ]);
    }

    /**
     * @return bool
     */
    public function isTest(): bool {
        return $this->value instanceof TestSubmissionState&& $this->type === 'test';
    }

    /**
     * @return TestSubmissionState
     */
    public function asTest(): TestSubmissionState {
        if (!($this->value instanceof TestSubmissionState&& $this->type === 'test')){
            throw new Exception(
                "Expected test; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isWorkspace(): bool {
        return $this->value instanceof WorkspaceSubmissionState&& $this->type === 'workspace';
    }

    /**
     * @return WorkspaceSubmissionState
     */
    public function asWorkspace(): WorkspaceSubmissionState {
        if (!($this->value instanceof WorkspaceSubmissionState&& $this->type === 'workspace')){
            throw new Exception(
                "Expected workspace; got " . $this->type . " with value of type " . get_debug_type($this->value),
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
            case 'test':
                $value = $this->asTest()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'workspace':
                $value = $this->asWorkspace()->jsonSerialize();
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
            case 'test':
                $args['value'] = TestSubmissionState::jsonDeserialize($data);
                break;
            case 'workspace':
                $args['value'] = WorkspaceSubmissionState::jsonDeserialize($data);
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
