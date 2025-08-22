# frozen_string_literal: true

module Seed
  module Headers
    module Types
      class SendLiteralsInHeadersRequest < Internal::Types::Model
        field :endpoint_version, -> { String }, optional: false, nullable: false
        field :async, -> { Internal::Types::Boolean }, optional: false, nullable: false
        field :query, -> { String }, optional: false, nullable: false
      end
    end
  end
end
