content_scripts = $(wildcard content_scripts/*.js)

euisu.zip: manifest.json $(content_scripts)
	zip $@ $^