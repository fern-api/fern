# frozen_string_literal: true

module Seed
    module Types
        class GetSubmissionStateResponse < Internal::Types::Model
            field :time_submitted, String, optional: true, nullable: false
            field :submission, String, optional: false, nullable: false
            field :language, Seed::Commons::Language, optional: false, nullable: false
            field :submission_type_state, Seed::Submission::SubmissionTypeState, optional: false, nullable: false

    end
end
