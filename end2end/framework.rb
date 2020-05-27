# !/usr/bin/env ruby
# frozen_string_literal: true

require "selenium-webdriver"

class E2ETests
  include Singleton

  def self.run(browser_name = :all, &block)
    instance.run(browser_name, &block)
  end

  # use thread pool to execute tests
  def run(browser_name)
    result = nil
    (browser_name == :all ? @browsers : [browser_name]).each do |browser|
      driver = init_remote(browser)
      result = yield driver
      driver.quit
    end
    return result
  end

  private

  def initialize
    @browsers = %i[firefox chrome]
  end

  def init_remote(browser)
    cap = Selenium::WebDriver::Remote::Capabilities.send(browser)
    driver = Selenium::WebDriver.for(
      :remote,
      url: ENV['SELENIUM_HUB_REMOTE'] || 'http://localhost:4444/wd/hub',
      desired_capabilities: cap
    )
    return driver
  end
end
