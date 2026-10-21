# frozen_string_literal: true

require_relative "../../seed"

module Seed
  module Types
    class NoAudiencePayload < Internal::Types::Model
      field :data, -> { String }, optional: false, nullable: false
    end
  end
end
