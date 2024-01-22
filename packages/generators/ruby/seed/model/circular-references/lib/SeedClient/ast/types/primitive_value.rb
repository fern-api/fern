# frozen_string_literal: true

module SeedClient
  module Ast
    # @type [Hash{String => String}] 
    PrimitiveValue = { string: 'STRING', number: 'NUMBER' }.frozen
  end
end