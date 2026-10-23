# frozen_string_literal: true

require_relative "../../seed"

module Seed
  module Types
    class Docs < Internal::Types::Model
      field :docs, -> { String }, optional: false, nullable: false
    end
  end
end
