# frozen_string_literal: true

module Seed
  module Types
    class InlinedChildRequest < Internal::Types::Model
      field :child, -> { String }, optional: false, nullable: false
      field :parent, -> { String }, optional: false, nullable: false
    end
  end
end
