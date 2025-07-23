# frozen_string_literal: true

module V2
    module Types
        class TestCaseExpects < Internal::Types::Model
            field :expected_stdout, Array, optional: true, nullable: true
        end
    end
end
