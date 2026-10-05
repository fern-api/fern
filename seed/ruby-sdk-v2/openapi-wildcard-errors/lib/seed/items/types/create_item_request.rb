# frozen_string_literal: true

module Seed
  module Items
    module Types
      class CreateItemRequest < Internal::Types::Model
        field :name, -> { String }, optional: false, nullable: false
      end
    end
  end
end
