# frozen_string_literal: true

module Seed
  module Types
    class TestSubmissionUpdateInfoFour < Internal::Types::Model
      field :type, -> { Seed::Types::TestSubmissionUpdateInfoFourType }, optional: false, nullable: false
    end
  end
end
