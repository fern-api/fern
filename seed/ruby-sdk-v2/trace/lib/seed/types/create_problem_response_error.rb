# frozen_string_literal: true

module Seed
  module Types
    class CreateProblemResponseError < Internal::Types::Model
      field :value, -> { Seed::Types::CreateProblemError }, optional: true, nullable: false
    end
  end
end
