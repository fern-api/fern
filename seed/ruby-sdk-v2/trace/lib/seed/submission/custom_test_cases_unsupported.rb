# frozen_string_literal: true

module Seed
    module Types
        class CustomTestCasesUnsupported < Internal::Types::Model
            field :problem_id, String, optional: false, nullable: false
            field :submission_id, String, optional: false, nullable: false

    end
end
