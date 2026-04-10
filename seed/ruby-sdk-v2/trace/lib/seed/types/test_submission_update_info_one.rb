# frozen_string_literal: true

module Seed
  module Types
    class TestSubmissionUpdateInfoOne < Internal::Types::Model
      field :type, -> { Seed::Types::TestSubmissionUpdateInfoOneType }, optional: false, nullable: false
    end
  end
end
