DRAFT=draft-hildebrand-html-rfc
#XMLJADE=../xmljade/bin/xmljade
XMLJADE=node_modules/.bin/xmljade
HTTPSERVER=../node_modules/.bin/http-server
LOCALHOST_DIR=localhost
RNG = draft-hoffman-xml2rfc/xml2rfcv3.rng
BRANCH := $(shell git symbolic-ref --short HEAD)

.PHONY: start stop
.PRECIOUS: %.3.xml %.n.xml %.x.xml

%.3.xml: %.xml convertv2v3/convertv2v3
	perl convertv2v3/convertv2v3  < $< > $@

%.n.xml: %.3.xml prep1.jade number.js server.PID
	$(XMLJADE) --pretty --xinclude --output $@ prep1.jade $<

%.x.xml: %.n.xml prep2.jade xref.js
	$(XMLJADE) --pretty --output $@ prep2.jade $<

%.3.html: %.x.xml v3tohtml.jade v3.js xml2rfc.css
	$(XMLJADE) --pretty --html --doublequote --output $@ v3tohtml.jade $<

%.txt: %.xml
	xml2rfc --text --html $<

all: $(DRAFT).3.html $(DRAFT).txt test.3.html

clean:
	$(RM) $(DRAFT).html $(DRAFT).3.html $(DRAFT).3.xml $(DRAFT).n.xml $(DRAFT).txt test.3.html test.n.xml test.x.xml

lint:
	xmllint --noout --relaxng $(RNG) *.3.xml *.n.xml *.x.xml

start: server.PID

server.PID:
	@cd $(LOCALHOST_DIR) && { $(HTTPSERVER) & echo $$! > ../$@; }
	@echo '`make stop` to stop the server'

stop:
	@if [ -a server.PID ]; then echo 'Stopping'; kill `cat server.PID`; rm server.PID; else echo 'Not running'; fi;

publish: test.3.html $(DRAFT).txt
	git co gh-pages
	git co $(BRANCH) -- xml2rfc.css
	git co $(BRANCH) -- test.x.xml
	git co $(BRANCH) -- test.n.xml
	git co $(BRANCH) -- test.3.xml
	git co $(BRANCH) -- test.3.html
	git co $(BRANCH) -- $(DRAFT).txt
	git co $(BRANCH) -- $(DRAFT).xml
	git co $(BRANCH) -- $(DRAFT).html
	git ci -m "Publish to GitHub pages"
	git push origin gh-pages
	git co $(BRANCH)
