# frozen_string_literal: true

module Seed
  module Nullable
    module Types
      class WeirdNumber < Internal::Types::Model
        extend Seed::Internal::Types::Union

        member -> { Integer }

        member -> { Float }

        member -> { String }

        member -> { Float }
      end
    end
  end
end
