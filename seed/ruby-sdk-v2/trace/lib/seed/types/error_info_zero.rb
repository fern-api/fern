# frozen_string_literal: true

module Seed
  module Types
    class ErrorInfoZero < Internal::Types::Model
      field :type, -> { Seed::Types::ErrorInfoZeroType }, optional: false, nullable: false
    end
  end
end
