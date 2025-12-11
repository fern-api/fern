<?php

namespace Seed\Submission\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class SubmissionStatusV2 extends JsonSerializableType
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
     *    TestSubmissionStatusV2
     *   |WorkspaceSubmissionStatusV2
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
     *    TestSubmissionStatusV2
     *   |WorkspaceSubmissionStatusV2
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
     * @param TestSubmissionStatusV2 $test
     * @return SubmissionStatusV2
     */
    public static function test(TestSubmissionStatusV2 $test): SubmissionStatusV2 {
        return new SubmissionStatusV2([
            'type' => 'test',
            'value' => $test,
        ]);
    }

    /**
     * @param WorkspaceSubmissionStatusV2 $workspace
     * @return SubmissionStatusV2
     */
    public static function workspace(WorkspaceSubmissionStatusV2 $workspace): SubmissionStatusV2 {
        return new SubmissionStatusV2([
            'type' => 'workspace',
            'value' => $workspace,
        ]);
    }

    /**
     * @return bool
     */
    public function isTest(): bool {
        return $this->value instanceof TestSubmissionStatusV2&& $this->type === 'test';
    }

    /**
     * @return TestSubmissionStatusV2
     */
    public function asTest(): TestSubmissionStatusV2 {
        if (!($this->value instanceof TestSubmissionStatusV2&& $this->type === 'test')){
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
        return $this->value instanceof WorkspaceSubmissionStatusV2&& $this->type === 'workspace';
    }

    /**
     * @return WorkspaceSubmissionStatusV2
     */
    public function asWorkspace(): WorkspaceSubmissionStatusV2 {
        if (!($this->value instanceof WorkspaceSubmissionStatusV2&& $this->type === 'workspace')){
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
                $args['value'] = TestSubmissionStatusV2::jsonDeserialize($data);
                break;
            case 'workspace':
                $args['value'] = WorkspaceSubmissionStatusV2::jsonDeserialize($data);
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
