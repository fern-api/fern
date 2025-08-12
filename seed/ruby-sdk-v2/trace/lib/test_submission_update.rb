# frozen_string_literal: true

module Submission
    module Types
        class TestSubmissionUpdate < Internal::Types::Model
            field :update_time, DateTime, optional: true, nullable: true
            field :update_info, TestSubmissionUpdateInfo, optional: true, nullable: true
        end
    end
end
