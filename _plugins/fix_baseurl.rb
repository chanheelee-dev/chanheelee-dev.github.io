# _plugins/fix_baseurl.rb
# jekyll-github-metadata (dep of jekyll-theme-primer) overrides site.baseurl
# with the GitHub Actions Pages staging path ("/pages/<owner>") even when
# baseurl is explicitly set to "" in _config.yml.
# This plugin re-registers on the same hook (:site, :after_reset) and runs
# after gem plugins, restoring the correct value from _config.yml.
Jekyll::Hooks.register :site, :after_reset do |site|
  configured = site.config["baseurl"]
  site.config["baseurl"] = configured.nil? ? "" : configured
end
