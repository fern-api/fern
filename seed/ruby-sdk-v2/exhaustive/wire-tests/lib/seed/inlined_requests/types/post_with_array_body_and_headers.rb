# frozen_string_literal: true

module Seed
  module InlinedRequests
    module Types
      class PostWithArrayBodyAndHeaders < Internal::Types::Model
        field :x_custom_header, -> { String }, optional: true, nullable: false, api_name: "X-Custom-Header"

        field :body, -> { Internal::Types::Array[String] }, optional: false, nullable: false
      end
    end
  end
end
