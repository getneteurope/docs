require 'minitest/autorun'
require 'minitest/color'
require_relative "../framework.rb"

class TestWhatsMyBrowser < Minitest::Test
  def test_firefox
    mybrowser = E2ETests.run(:firefox) do |browser|
      browser.navigate.to 'https://whatsmybrowser.org'
      browser.find_element(css: 'h2.header').text
    end
    assert_match(/Firefox/, mybrowser)
  end

  def test_chrome
    mybrowser = E2ETests.run(:chrome) do |browser|
      browser.navigate.to 'https://whatsmybrowser.org'
      browser.find_element(css: 'h2.header').text
    end
    assert_match(/Chrome/, mybrowser)
  end
end
