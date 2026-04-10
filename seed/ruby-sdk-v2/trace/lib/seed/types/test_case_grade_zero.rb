# frozen_string_literal: true

module Seed
  module Types
    class TestCaseGradeZero < Internal::Types::Model
      field :type, -> { Seed::Types::TestCaseGradeZeroType }, optional: false, nullable: false
    end
  end
end
