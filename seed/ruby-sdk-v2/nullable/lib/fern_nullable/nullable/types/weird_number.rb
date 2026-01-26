# frozen_string_literal: true

module FernNullable
  module Nullable
    module Types
      class WeirdNumber < Internal::Types::Model
        extend FernNullable::Internal::Types::Union

        member -> { Integer }
        member -> { Integer }
        member -> { String }
        member -> { Integer }
      end
    end
  end
end
