# frozen_string_literal: true

module SeedClient
  module Submission
    # @type [Hash{String => String}]
    RUNNING_SUBMISSION_STATE = { queueing_submission: "QUEUEING_SUBMISSION",
                                 killing_historical_submissions: "KILLING_HISTORICAL_SUBMISSIONS", writing_submission_to_file: "WRITING_SUBMISSION_TO_FILE", compiling_submission: "COMPILING_SUBMISSION", running_submission: "RUNNING_SUBMISSION" }.frozen
  end
end
