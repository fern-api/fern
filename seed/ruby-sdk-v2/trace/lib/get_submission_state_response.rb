# frozen_string_literal: true

module Submission
    module Types
        class GetSubmissionStateResponse < Internal::Types::Model
            field :time_submitted, Array, optional: true, nullable: true
            field :submission, String, optional: true, nullable: true
            field :language, Language, optional: true, nullable: true
            field :submission_type_state, SubmissionTypeState, optional: true, nullable: true
        end
    end
end
