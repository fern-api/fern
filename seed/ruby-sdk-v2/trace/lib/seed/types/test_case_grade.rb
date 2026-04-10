# frozen_string_literal: true

module Seed
  module Types
    class TestCaseGrade < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::TestCaseGradeZero }
      member -> { Seed::Types::TestCaseGradeOne }
    end
  end
end
