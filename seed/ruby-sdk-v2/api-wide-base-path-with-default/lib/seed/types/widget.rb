# frozen_string_literal: true

require_relative ".."

module Seed
  module Types
    class Widget < Internal::Types::Model
      field :name, -> { String }, optional: false, nullable: false
    end
  end
end
