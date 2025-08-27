# frozen_string_literal: true

module Seed
  module Submission
    module Types
      module RunningSubmissionState
        extend Seed::Internal::Types::Enum

        QUEUEING_SUBMISSION = "QUEUEING_SUBMISSION"
        KILLING_HISTORICAL_SUBMISSIONS = "KILLING_HISTORICAL_SUBMISSIONS"
        WRITING_SUBMISSION_TO_FILE = "WRITING_SUBMISSION_TO_FILE"
        COMPILING_SUBMISSION = "COMPILING_SUBMISSION"
        RUNNING_SUBMISSION = "RUNNING_SUBMISSION"end
    end
  end
end
