# frozen_string_literal: true

module Seed
    module Types
        class TestSubmissionUpdate < Internal::Types::Model
            field :update_time, String, optional: false, nullable: false
            field :update_info, Seed::Submission::TestSubmissionUpdateInfo, optional: false, nullable: false

    end
end
