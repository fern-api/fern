# frozen_string_literal: true

module Seed
  module Types
    module Union
      module Types
        class Animal
          extend Seed::Internal::Types::Union

          discriminant :animal

          member -> { Seed::Types::Union::Types::Dog }, key: "DOG"
          member -> { Seed::Types::Union::Types::Cat }, key: "CAT"
        end
      end
    end
  end
end
