# frozen_string_literal: true

require_relative "../../seed"

module Seed
  module Types
    class DataContextHeartbeat < Internal::Types::Model
      field :timestamp, -> { String }, optional: true, nullable: false
    end
  end
end
