# frozen_string_literal: true

module Seed
  module Types
    class SubmissionRequestThree < Internal::Types::Model
      field :type, -> { Seed::Types::SubmissionRequestThreeType }, optional: false, nullable: false
    end
  end
end
