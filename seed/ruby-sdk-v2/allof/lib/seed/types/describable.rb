# frozen_string_literal: true

module Seed
  module Types
    class Describable < Internal::Types::Model
      field :name, -> { String }, optional: true, nullable: false
      field :summary, -> { String }, optional: true, nullable: false
    end
  end
end
