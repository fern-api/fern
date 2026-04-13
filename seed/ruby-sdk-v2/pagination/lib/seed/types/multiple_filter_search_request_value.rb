# frozen_string_literal: true

module Seed
  module Types
    class MultipleFilterSearchRequestValue < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Internal::Types::Array[Seed::Types::MultipleFilterSearchRequest] }
      member -> { Internal::Types::Array[Seed::Types::SingleFilterSearchRequest] }
    end
  end
end
