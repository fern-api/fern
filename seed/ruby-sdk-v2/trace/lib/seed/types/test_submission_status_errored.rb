# frozen_string_literal: true

module Seed
  module Types
    class TestSubmissionStatusErrored < Internal::Types::Model
      field :value, -> { Seed::Types::ErrorInfo }, optional: true, nullable: false
    end
  end
end
