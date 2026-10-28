# frozen_string_literal: true

require_relative "../../../seed"

module Seed
  module Submission
    module Types
      class TestCaseHiddenGrade < Internal::Types::Model
        field :passed, -> { Internal::Types::Boolean }, optional: false, nullable: false
      end
    end
  end
end
