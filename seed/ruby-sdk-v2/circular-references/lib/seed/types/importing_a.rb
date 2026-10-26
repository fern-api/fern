# frozen_string_literal: true

require_relative "../../seed"

module Seed
  module Types
    class ImportingA < Internal::Types::Model
      field :a, -> { Seed::A::Types::A }, optional: true, nullable: false
    end
  end
end
