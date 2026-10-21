# frozen_string_literal: true

require_relative "../../../seed"

module Seed
  module Types
    module Types
      class Moment < Internal::Types::Model
        field :id, -> { String }, optional: false, nullable: false

        field :date, -> { String }, optional: false, nullable: false

        field :datetime, -> { String }, optional: false, nullable: false
      end
    end
  end
end
