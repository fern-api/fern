# frozen_string_literal: true

module Seed
  module Types
    class TestSubmissionUpdateInfoFive < Internal::Types::Model
      field :type, -> { Seed::Types::TestSubmissionUpdateInfoFiveType }, optional: false, nullable: false
    end
  end
end
