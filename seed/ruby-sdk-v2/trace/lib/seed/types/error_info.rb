# frozen_string_literal: true

module Seed
  module Types
    class ErrorInfo < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::ErrorInfoZero }
      member -> { Seed::Types::ErrorInfoOne }
      member -> { Seed::Types::ErrorInfoTwo }
    end
  end
end
