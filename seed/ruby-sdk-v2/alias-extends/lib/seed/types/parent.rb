# frozen_string_literal: true

require_relative ".."

module Seed
  module Types
    class Parent < Internal::Types::Model
      field :parent, -> { String }, optional: false, nullable: false
    end
  end
end
