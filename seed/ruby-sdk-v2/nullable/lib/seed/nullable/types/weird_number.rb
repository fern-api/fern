# frozen_string_literal: true

module Seed
  module Nullable
    module Types
      class WeirdNumber < Internal::Types::Model
        extend Seed::Internal::Types::Union

        member -> { Integer }
        member -> { Integer }
        member -> { String }
        member -> { Integer }
      end
    end
  end
end
