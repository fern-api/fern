<?php

namespace Seed\Traits;

use Seed\SubmissionRequestZero;
use Seed\SubmissionRequestType;
use Seed\SubmissionRequestTwo;
use Seed\SubmissionRequestThree;
use Seed\SubmissionRequestFour;
use Seed\InvalidRequestCauseZero;
use Seed\InvalidRequestCauseOne;
use Seed\InvalidRequestCauseTwo;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

/**
 * @property (
 *    SubmissionRequestZero
 *   |SubmissionRequestType
 *   |SubmissionRequestTwo
 *   |SubmissionRequestThree
 *   |SubmissionRequestFour
 * ) $request
 * @property (
 *    InvalidRequestCauseZero
 *   |InvalidRequestCauseOne
 *   |InvalidRequestCauseTwo
 * ) $cause
 */
trait InvalidRequestResponse
{
    /**
     * @var (
     *    SubmissionRequestZero
     *   |SubmissionRequestType
     *   |SubmissionRequestTwo
     *   |SubmissionRequestThree
     *   |SubmissionRequestFour
     * ) $request
     */
    #[JsonProperty('request'), Union(SubmissionRequestZero::class, SubmissionRequestType::class, SubmissionRequestTwo::class, SubmissionRequestThree::class, SubmissionRequestFour::class)]
    public SubmissionRequestZero|SubmissionRequestType|SubmissionRequestTwo|SubmissionRequestThree|SubmissionRequestFour $request;

    /**
     * @var (
     *    InvalidRequestCauseZero
     *   |InvalidRequestCauseOne
     *   |InvalidRequestCauseTwo
     * ) $cause
     */
    #[JsonProperty('cause'), Union(InvalidRequestCauseZero::class, InvalidRequestCauseOne::class, InvalidRequestCauseTwo::class)]
    public InvalidRequestCauseZero|InvalidRequestCauseOne|InvalidRequestCauseTwo $cause;
}
