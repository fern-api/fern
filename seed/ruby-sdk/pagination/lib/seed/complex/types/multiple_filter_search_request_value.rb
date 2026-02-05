# frozen_string_literal: true

module Seed
  module Complex
    module Types
      class MultipleFilterSearchRequestValue < Internal::Types::Model
        extend Seed::Internal::Types::Union

        member -> { Internal::Types::Array[Seed::Complex::Types::MultipleFilterSearchRequest] }
        member -> { Internal::Types::Array[Seed::Complex::Types::SingleFilterSearchRequest] }
      end
    end
  end
end
