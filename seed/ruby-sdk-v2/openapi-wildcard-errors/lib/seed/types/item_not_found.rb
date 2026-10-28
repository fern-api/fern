# frozen_string_literal: true

require_relative "../../seed"

module Seed
  module Types
    class ItemNotFound < Internal::Types::Model
      field :item_id, -> { String }, optional: false, nullable: false
    end
  end
end
