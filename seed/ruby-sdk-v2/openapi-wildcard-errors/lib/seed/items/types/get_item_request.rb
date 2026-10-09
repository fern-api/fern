# frozen_string_literal: true

module Seed
  module Items
    module Types
      class GetItemRequest < Internal::Types::Model
        field :item_id, -> { String }, optional: false, nullable: false
      end
    end
  end
end
