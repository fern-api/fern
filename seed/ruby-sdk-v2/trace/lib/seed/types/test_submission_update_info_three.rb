# frozen_string_literal: true

module Seed
  module Types
    class TestSubmissionUpdateInfoThree < Internal::Types::Model
      field :type, -> { Seed::Types::TestSubmissionUpdateInfoThreeType }, optional: false, nullable: false
    end
  end
end
