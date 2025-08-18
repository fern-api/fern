# frozen_string_literal: true

module Seed
    module Types
        class RecordingResponseNotification < Internal::Types::Model
            field :submission_id, String, optional: false, nullable: false
            field :test_case_id, String, optional: true, nullable: false
            field :line_number, Integer, optional: false, nullable: false
            field :lightweight_stack_info, Seed::Submission::LightweightStackframeInformation, optional: false, nullable: false
            field :traced_file, Seed::Submission::TracedFile, optional: true, nullable: false

    end
end
