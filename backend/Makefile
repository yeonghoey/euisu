.PHONY: install

make install:
	go install ./euisu
	launchctl unload ~/Library/LaunchAgents/com.yeonghoey.euisu.plist
	launchctl load ~/Library/LaunchAgents/com.yeonghoey.euisu.plist