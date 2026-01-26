# frozen_string_literal: true

module FernPagination
  module Complex
    module Types
      class MultipleFilterSearchRequestValue < Internal::Types::Model
        extend FernPagination::Internal::Types::Union

        member -> { Internal::Types::Array[FernPagination::Complex::Types::MultipleFilterSearchRequest] }
        member -> { Internal::Types::Array[FernPagination::Complex::Types::SingleFilterSearchRequest] }
      end
    end
  end
end
