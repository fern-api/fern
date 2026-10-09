# frozen_string_literal: true

module Seed
  module Types
    class ItemNotFound < Internal::Types::Model
      field :item_id, -> { String }, optional: false, nullable: false
    end
  end
end
