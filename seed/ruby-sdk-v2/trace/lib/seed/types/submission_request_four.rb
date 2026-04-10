# frozen_string_literal: true

module Seed
  module Types
    class SubmissionRequestFour < Internal::Types::Model
      field :type, -> { Seed::Types::SubmissionRequestFourType }, optional: false, nullable: false
    end
  end
end
