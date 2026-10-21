# frozen_string_literal: true

require_relative "../../seed"

module Seed
  module Types
    class Event < Internal::Types::Model
      field :data, -> { String }, optional: false, nullable: false

      field :event, -> { String }, optional: true, nullable: false

      field :id, -> { String }, optional: true, nullable: false

      field :retry_, -> { Integer }, optional: true, nullable: false, api_name: "retry"
    end
  end
end
