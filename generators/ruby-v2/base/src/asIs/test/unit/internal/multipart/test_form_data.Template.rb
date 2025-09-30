# frozen_string_literal: true

require "minitest/autorun"
require "stringio"
require "json"
require "test_helper"

class MockFile
  attr_reader :name, :content, :content_type

  def initialize(name:, content:, content_type: nil)
    @name = name
    @content = content
    @content_type = content_type
  end

  def read
    @content
  end
end

class MultipartTest < Minitest::Test
  def test_empty_form_data
    form_data = <%= gem_namespace %>::Internal::Multipart::FormData.new
    body = form_data.encode

    assert_equal "", body
  end

  def test_write_field
    [
      {
        desc: "empty field",
        field: "empty",
        value: ""
      },
      {
        desc: "simple field",
        field: "greeting",
        value: "hello world"
      },
      {
        desc: "field with content type",
        field: "message",
        value: "hello",
        content_type: "text/plain"
      }
    ].each do |test_case|
      form_data = <%= gem_namespace %>::Internal::Multipart::FormData.new
      content_type_arg = test_case[:content_type]

      form_data.add(
        name: test_case[:field],
        value: test_case[:value],
        content_type: content_type_arg
      )

      content_type = form_data.content_type
      body = form_data.encode

      # Extract the boundary from the content type
      boundary = content_type.match(/boundary=([^;]+)/)[1]

      # Verify the field was encoded properly
      assert_includes body, "--#{boundary}"
      assert_includes body, "Content-Disposition: form-data; name=\"#{test_case[:field]}\""

      assert_includes body, "Content-Type: #{content_type_arg}" if content_type_arg

      assert_includes body, test_case[:value]
    end
  end

  def test_write_file_param
    [
      {
        desc: "file param with content type",
        field: "file",
        filename: "test.txt",
        content: "hello world",
        content_type: "text/plain"
      },
      {
        desc: "file param with override content type",
        field: "file",
        filename: "test.txt",
        content: "hello world",
        content_type: "text/plain",
        override_content_type: "application/octet-stream"
      }
    ].each do |test_case|
      form_data = <%= gem_namespace %>::Internal::Multipart::FormData.new

      file_param = <%= gem_namespace %>::FileParam.from_string(
        content: test_case[:content],
        filename: test_case[:filename],
        content_type: test_case[:content_type]
      )

      form_data.add_part(
        file_param.to_form_data_part(
          name: test_case[:field],
          content_type: test_case[:override_content_type]
        )
      )

      content_type = form_data.content_type
      body = form_data.encode

      # Extract the boundary from the content type
      boundary = content_type.match(/boundary=([^;]+)/)[1]

      # Verify the file param was encoded properly
      assert_includes body, "--#{boundary}"
      assert_includes body,
                      "Content-Disposition: form-data; name=\"#{test_case[:field]}\"; filename=\"#{test_case[:filename]}\""

      expected_content_type = test_case[:override_content_type] || test_case[:content_type]
      assert_includes body, "Content-Type: #{expected_content_type}" if expected_content_type

      assert_includes body, test_case[:content]
    end
  end

  def test_write_json
    [
      {
        desc: "struct",
        field: "data",
        value: { name: "test", value: 123 }
      },
      {
        desc: "map",
        field: "data",
        value: { key: "value" }
      }
    ].each do |test_case|
      form_data = <%= gem_namespace %>::Internal::Multipart::FormData.new

      form_data.add(
        name: test_case[:field],
        value: test_case[:value].to_json,
        content_type: "application/json"
      )

      content_type = form_data.content_type
      body = form_data.encode

      # Extract the boundary from the content type
      boundary = content_type.match(/boundary=([^;]+)/)[1]

      # Verify the JSON was encoded properly
      assert_includes body, "--#{boundary}"
      assert_includes body, "Content-Disposition: form-data; name=\"#{test_case[:field]}\""
      assert_includes body, "Content-Type: application/json"
      assert_includes body, test_case[:value].to_json
    end
  end

  def test_complex_form
    form_data = <%= gem_namespace %>::Internal::Multipart::FormData.new

    # Add multiple fields and files
    form_data.add(name: "foo", value: "bar")
    form_data.add(name: "baz", value: "qux")

    part = <%= gem_namespace %>::FileParam.from_string(
      content: "Hello, world!",
      filename: "file.txt",
      content_type: "text/plain"
    )

    form_data.add_part(part.to_form_data_part(name: "file"))
    form_data.add(name: "data", value: { key: "value" }.to_json, content_type: "application/json")

    content_type = form_data.content_type
    body = form_data.encode

    # Extract the boundary from the content type
    boundary = content_type.match(/boundary=([^;]+)/)[1]

    # Verify all parts are in the body
    assert_includes body, "--#{boundary}"
    assert_includes body, "Content-Disposition: form-data; name=\"foo\""
    assert_includes body, "bar"
    assert_includes body, "Content-Disposition: form-data; name=\"baz\""
    assert_includes body, "qux"
    assert_includes body, "Content-Disposition: form-data; name=\"file\"; filename=\"file.txt\""
    assert_includes body, "Content-Type: text/plain"
    assert_includes body, "Hello, world!"
    assert_includes body, "Content-Disposition: form-data; name=\"data\""
    assert_includes body, "Content-Type: application/json"
    assert_includes body, "{\"key\":\"value\"}"
  end

  def test_file_param_from_filepath
    # Create a temporary file for testing
    file_content = "Test file content"
    temp_file = Tempfile.new(["test", ".txt"])
    begin
      temp_file.write(file_content)
      temp_file.rewind

      file_param = <%= gem_namespace %>::FileParam.from_filepath(
        filepath: temp_file.path,
        content_type: "text/plain"
      )

      # Verify the file param was created properly
      form_data = <%= gem_namespace %>::Internal::Multipart::FormData.new
      form_data.add_part(file_param.to_form_data_part(name: "file"))

      content_type = form_data.content_type
      body = form_data.encode

      # Extract the boundary from the content type
      boundary = content_type.match(/boundary=([^;]+)/)[1]

      # Verify the file was encoded properly
      assert_includes body, "--#{boundary}"
      assert_includes body,
                      "Content-Disposition: form-data; name=\"file\"; filename=\"#{File.basename(temp_file.path)}\""
      assert_includes body, "Content-Type: text/plain"
      assert_includes body, file_content
    ensure
      # Close and delete the temporary file
      temp_file.close
      temp_file.unlink
    end
  end

  def test_file_param_from_string
    file_content = "Test string content"
    filename = "string.txt"
    content_type = "text/plain"

    file_param = <%= gem_namespace %>::FileParam.from_string(
      content: file_content,
      filename: filename,
      content_type: content_type
    )

    # Verify the file param was created properly
    form_data = <%= gem_namespace %>::Internal::Multipart::FormData.new
    form_data.add_part(file_param.to_form_data_part(name: "file"))

    content_type = form_data.content_type
    body = form_data.encode

    # Extract the boundary from the content type
    boundary = content_type.match(/boundary=([^;]+)/)[1]

    # Verify the file was encoded properly
    assert_includes body, "--#{boundary}"
    assert_includes body, "Content-Disposition: form-data; name=\"file\"; filename=\"#{filename}\""
    assert_includes body, "Content-Type: text/plain"
    assert_includes body, file_content
  end

  def test_encoder_file_reading_in_chunks
    file_size = 1024 * 100 # 100KB
    large_content = "x" * file_size

    temp_file = Tempfile.new(["large", ".dat"])
    begin
      temp_file.write(large_content)
      temp_file.rewind

      form_data = <%= gem_namespace %>::Internal::Multipart::FormData.new
      form_data.add_file(
        name: "large_file",
        file: temp_file,
        content_type: "application/octet-stream"
      )

      content_type = form_data.content_type
      body = form_data.encode

      boundary = content_type.match(/boundary=([^;]+)/)[1]

      assert_includes body, "--#{boundary}"
      assert_includes body,
                      "Content-Disposition: form-data; name=\"large_file\"; filename=\"#{File.basename(temp_file.path)}\""
      assert_includes body, "Content-Type: application/octet-stream"

      content_start = body.index("Content-Type: application/octet-stream\r\n\r\n") +
                      "Content-Type: application/octet-stream\r\n\r\n".length

      content_end = body.index("\r\n--#{boundary}", content_start)

      actual_content = body[content_start...content_end]

      assert_equal file_size, actual_content.length

      # Verify the content is correct (checking first, middle, and last parts).
      assert_equal "x" * 100, actual_content[0...100]
      assert_equal "x" * 100, actual_content[((file_size / 2) - 50)...((file_size / 2) + 50)]
      assert_equal "x" * 100, actual_content[(file_size - 100)...file_size]
    ensure
      # Close and delete the temporary file.
      temp_file.close
      temp_file.unlink
    end
  end

  def test_error_handling_for_missing_file
    assert_raises(StandardError) do
      <%= gem_namespace %>::FileParam.from_filepath(filepath: "nonexistent_file.txt")
    end
  end
end
