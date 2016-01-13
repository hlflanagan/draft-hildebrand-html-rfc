XMLJADE=node_modules/.bin/xmljade
HTTPSERVER=node_modules/.bin/http-server
LOCALHOST_DIR=localhost
RNG = draft-hoffman-xml2rfc/xml2rfcv3-full.rng

.PHONY: start stop clean lint
.PRECIOUS: %.3.xml %.n.xml %.x.xml

%.3.xml: %.xml convertv2v3/convertv2v3
	perl convertv2v3/convertv2v3  < $< > $@

%.n.xml: %.3.xml prep1.jade lib.jade number.js server.PID
	$(XMLJADE) --pretty --xinclude --output $@ prep1.jade $<

%.x.xml: %.n.xml prep2.jade lib.jade xref.js
	$(XMLJADE) --pretty --output $@ prep2.jade $<

%.3.html: %.x.xml v3tohtml.jade lib.jade v3.js dt.js xml2rfc.css
	$(XMLJADE) --pretty --html --doublequote --output $@ v3tohtml.jade $<

all: test.3.html

clean:
	$(RM) test.3.html test.n.xml test.x.xml

lint: server.PID
	xmllint --noout --noent --xinclude --relaxng $(RNG) *.3.xml *.n.xml *.x.xml

start: server.PID

server.PID:
	$(HTTPSERVER) $(LOCALHOST_DIR) & echo $$! > $@;
	@echo '`make stop` to stop the server'

stop:
	@if [ -a server.PID ]; then echo 'Stopping'; kill `cat server.PID`; rm server.PID; else echo 'Not running'; fi;
