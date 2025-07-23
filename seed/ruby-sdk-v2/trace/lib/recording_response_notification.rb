# frozen_string_literal: true

module Submission
    module Types
        class RecordingResponseNotification < Internal::Types::Model
            field :submission_id, SubmissionId, optional: true, nullable: true
            field :test_case_id, Array, optional: true, nullable: true
            field :line_number, Integer, optional: true, nullable: true
            field :lightweight_stack_info, LightweightStackframeInformation, optional: true, nullable: true
            field :traced_file, Array, optional: true, nullable: true
        end
    end
end
