# frozen_string_literal: true

require_relative "../../seed"

module Seed
  module Types
    class PrivatePayload < Internal::Types::Model
      field :secret, -> { String }, optional: false, nullable: false
    end
  end
end
