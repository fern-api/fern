# frozen_string_literal: true

module Seed
  module Types
    class Failure < Internal::Types::Model
      field :status, -> { Seed::Types::FailureStatus }, optional: false, nullable: false
    end
  end
end
