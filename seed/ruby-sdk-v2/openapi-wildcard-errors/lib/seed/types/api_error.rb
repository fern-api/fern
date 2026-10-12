# frozen_string_literal: true

module Seed
  module Types
    # The shared error body returned for every 4XX and 5XX status.
    class APIError < Internal::Types::Model
      field :error_type, -> { String }, optional: false, nullable: false

      field :error_code, -> { String }, optional: false, nullable: false

      field :error_message, -> { String }, optional: false, nullable: false

      field :request_id, -> { String }, optional: true, nullable: false
    end
  end
end
