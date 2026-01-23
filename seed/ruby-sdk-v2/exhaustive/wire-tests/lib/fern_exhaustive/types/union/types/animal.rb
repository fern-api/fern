# frozen_string_literal: true

module FernExhaustive
  module Types
    module Union
      module Types
        class Animal < Internal::Types::Model
          extend FernExhaustive::Internal::Types::Union

          discriminant :animal

          member -> { FernExhaustive::Types::Union::Types::Dog }, key: "DOG"
          member -> { FernExhaustive::Types::Union::Types::Cat }, key: "CAT"
        end
      end
    end
  end
end
