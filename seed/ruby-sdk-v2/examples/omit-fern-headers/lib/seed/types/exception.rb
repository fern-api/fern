# frozen_string_literal: true

module Seed
  module Types
    class Exception < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::ExceptionZero }
      member -> { Seed::Types::ExceptionType }
    end
  end
end
