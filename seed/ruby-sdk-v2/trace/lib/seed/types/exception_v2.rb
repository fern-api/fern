# frozen_string_literal: true

module Seed
  module Types
    class ExceptionV2 < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::ExceptionV2Zero }
      member -> { Seed::Types::ExceptionV2Type }
    end
  end
end
