# frozen_string_literal: true

module FernEmptyClients
  module Level1
    module Types
      module Types
        class Person < Internal::Types::Model
          field :name, -> { String }, optional: false, nullable: false
          field :address, -> { FernEmptyClients::Level1::Types::Types::Address }, optional: false, nullable: false
        end
      end
    end
  end
end
