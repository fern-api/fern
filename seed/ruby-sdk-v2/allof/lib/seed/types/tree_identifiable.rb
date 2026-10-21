# frozen_string_literal: true

require_relative "../../seed"

module Seed
  module Types
    class TreeIdentifiable < Internal::Types::Model
      field :id, -> { String }, optional: false, nullable: false
    end
  end
end
