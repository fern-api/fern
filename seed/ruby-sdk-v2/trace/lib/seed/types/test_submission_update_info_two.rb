# frozen_string_literal: true

module Seed
  module Types
    class TestSubmissionUpdateInfoTwo < Internal::Types::Model
      field :type, -> { Seed::Types::TestSubmissionUpdateInfoTwoType }, optional: false, nullable: false
      field :value, -> { Seed::Types::ErrorInfo }, optional: true, nullable: false
    end
  end
end
