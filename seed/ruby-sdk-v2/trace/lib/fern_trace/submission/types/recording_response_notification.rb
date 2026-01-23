# frozen_string_literal: true

module FernTrace
  module Submission
    module Types
      class RecordingResponseNotification < Internal::Types::Model
        field :submission_id, -> { String }, optional: false, nullable: false, api_name: "submissionId"
        field :test_case_id, -> { String }, optional: true, nullable: false, api_name: "testCaseId"
        field :line_number, -> { Integer }, optional: false, nullable: false, api_name: "lineNumber"
        field :lightweight_stack_info, -> { FernTrace::Submission::Types::LightweightStackframeInformation }, optional: false, nullable: false, api_name: "lightweightStackInfo"
        field :traced_file, -> { FernTrace::Submission::Types::TracedFile }, optional: true, nullable: false, api_name: "tracedFile"
      end
    end
  end
end
