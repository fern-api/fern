# frozen_string_literal: true

module Submission
    module Types
        class TraceResponse < Internal::Types::Model
            field :submission_id, SubmissionId, optional: true, nullable: true
            field :line_number, Integer, optional: true, nullable: true
            field :return_value, Array, optional: true, nullable: true
            field :expression_location, Array, optional: true, nullable: true
            field :stack, StackInformation, optional: true, nullable: true
            field :stdout, Array, optional: true, nullable: true
        end
    end
end
